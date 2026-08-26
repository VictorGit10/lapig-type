export type KeystrokeEvent = {
  delta: number;
  correct: boolean;
  key: string;
  repeat?: boolean;
};

export type ScoreInput = {
  expectedText: string;
  clientElapsedMs: number;
  serverElapsedMs: number;
  reportedMistakes: number;
  visibilityChanges: number;
  events: KeystrokeEvent[];
};

export type ScoreVerdict = {
  grossWpm: number;
  accuracy: number;
  score: number;
  durationMs: number;
  trustStatus: 'accepted' | 'review' | 'rejected';
  flags: string[];
};

export function scoreAttempt(input: ScoreInput): ScoreVerdict {
  const fatal: string[] = [];
  const suspicious: string[] = [];
  const events = Array.isArray(input.events) ? input.events : [];
  const expectedText = typeof input.expectedText === 'string' ? input.expectedText : '';
  const expectedChars = expectedText.length;
  const durationMs = Math.max(Math.round(input.clientElapsedMs), Math.round(input.serverElapsedMs));
  const correctEvents = events.filter((event) => event.correct);
  const mistakeEvents = events.length - correctEvents.length;

  if (expectedChars < 80 || expectedChars > 1200) fatal.push('invalid_expected_length');
  if (events.length > 2400 || events.length < expectedChars) fatal.push('invalid_event_count');
  if (correctEvents.length !== expectedChars) fatal.push('incomplete_sequence');
  if (mistakeEvents !== input.reportedMistakes) fatal.push('mistake_mismatch');
  if (!Number.isFinite(durationMs) || durationMs < 1_000 || durationMs > 20 * 60_000) fatal.push('invalid_duration');
  if (Math.abs(input.clientElapsedMs - input.serverElapsedMs) > 5_000) fatal.push('clock_mismatch');

  const deltas = events.map((event) => event.delta);
  if (deltas.some((delta) => !Number.isFinite(delta) || delta < 0 || delta > 120_000)) fatal.push('invalid_timing_event');
  const eventDuration = deltas.reduce((sum, delta) => sum + delta, 0);
  if (Math.abs(eventDuration - input.clientElapsedMs) > 1_500) fatal.push('event_timeline_mismatch');

  let sequenceCursor = 0;
  let sequenceValid = true;
  for (const event of events) {
    if (typeof event.key !== 'string' || event.key.length !== 1) {
      sequenceValid = false;
      continue;
    }
    const matches = event.key.normalize('NFC') === expectedText[sequenceCursor]?.normalize('NFC');
    if (event.correct !== matches) sequenceValid = false;
    if (matches) sequenceCursor += 1;
  }
  if (!sequenceValid || sequenceCursor !== expectedChars) fatal.push('key_sequence_mismatch');

  const grossWpm = Math.round((expectedChars / 5) / Math.max(durationMs / 60_000, 1 / 60_000));
  const accuracy = Math.round((expectedChars / Math.max(events.length, 1)) * 100);
  const score = Math.max(0, Math.round(grossWpm * Math.pow(accuracy / 100, 2)));

  if (grossWpm > 220) fatal.push('impossible_speed');
  if (accuracy < 60) fatal.push('excessive_errors');

  const measured = deltas.slice(1).filter((delta) => delta > 0);
  const veryFastRatio = measured.length ? measured.filter((delta) => delta < 12).length / measured.length : 0;
  if (veryFastRatio > 0.06) fatal.push('machine_speed_burst');

  if (measured.length >= 60) {
    const average = measured.reduce((sum, value) => sum + value, 0) / measured.length;
    const variance = measured.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / measured.length;
    if (average > 0 && Math.sqrt(variance) / average < 0.08) suspicious.push('low_timing_variance');

    const buckets = new Map<number, number>();
    measured.forEach((value) => {
      const bucket = Math.round(value / 5) * 5;
      buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    });
    const largestBucket = Math.max(...buckets.values());
    if (largestBucket / measured.length > 0.72) suspicious.push('repetitive_timing_pattern');
  }

  const repeatRatio = events.length ? events.filter((event) => event.repeat).length / events.length : 0;
  if (repeatRatio > 0.05) suspicious.push('excessive_key_repeat');
  if (input.visibilityChanges > 8) suspicious.push('excessive_focus_changes');

  const flags = [...new Set([...fatal, ...suspicious])];
  const trustStatus = fatal.length ? 'rejected' : suspicious.length ? 'review' : 'accepted';
  return { grossWpm, accuracy, score, durationMs, trustStatus, flags };
}
