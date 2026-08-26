import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreAttempt, type KeystrokeEvent } from '../app/lib/scoring.ts';

function humanTimeline(typedText: string, mistakes = 0, activeDuration = 58_000): KeystrokeEvent[] {
  const total = typedText.length + mistakes;
  const weights = Array.from({ length: total - 1 }, (_, index) => 1 + Math.sin(index * 1.73) * 0.28);
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const deltas = [0, ...weights.map((weight) => Math.round(activeDuration * weight / weightSum))];
  deltas[deltas.length - 1] += activeDuration - deltas.reduce((sum, value) => sum + value, 0);
  return deltas.map((delta, index) => ({
    delta,
    correct: index >= mistakes,
    key: index < mistakes ? '!' : typedText[index - mistakes],
    repeat: false,
  }));
}

const passage = 'a'.repeat(800);
const typedExcerpt = passage.slice(0, 300);

test('accepts a plausible partial sequence after the one-minute challenge', () => {
  const verdict = scoreAttempt({
    expectedText: passage,
    clientElapsedMs: 60_000,
    serverElapsedMs: 60_250,
    reportedMistakes: 0,
    visibilityChanges: 1,
    events: humanTimeline(typedExcerpt),
  });
  assert.equal(verdict.trustStatus, 'accepted');
  assert.equal(verdict.grossWpm, 60);
  assert.equal(verdict.accuracy, 100);
  assert.equal(verdict.durationMs, 60_000);
});

test('penalizes mistakes in the competitive score', () => {
  const verdict = scoreAttempt({
    expectedText: passage,
    clientElapsedMs: 60_000,
    serverElapsedMs: 60_200,
    reportedMistakes: 15,
    visibilityChanges: 0,
    events: humanTimeline(typedExcerpt, 15),
  });
  assert.equal(verdict.trustStatus, 'accepted');
  assert.equal(verdict.accuracy, 95);
  assert.ok(verdict.score < verdict.grossWpm);
});

test('rejects machine-speed bursts', () => {
  const fastPassage = 'a'.repeat(800);
  const events = Array.from({ length: 400 }, (_, index) => ({ delta: index === 0 ? 0 : 5, correct: true, key: 'a', repeat: false }));
  const verdict = scoreAttempt({
    expectedText: fastPassage,
    clientElapsedMs: 60_000,
    serverElapsedMs: 60_050,
    reportedMistakes: 0,
    visibilityChanges: 0,
    events,
  });
  assert.equal(verdict.trustStatus, 'rejected');
  assert.ok(verdict.flags.includes('machine_speed_burst'));
});

test('rejects a forged one-minute clock', () => {
  const verdict = scoreAttempt({
    expectedText: passage,
    clientElapsedMs: 15_000,
    serverElapsedMs: 60_000,
    reportedMistakes: 0,
    visibilityChanges: 0,
    events: humanTimeline('a'.repeat(190), 0, 15_000),
  });
  assert.equal(verdict.trustStatus, 'rejected');
  assert.ok(verdict.flags.includes('clock_mismatch'));
  assert.ok(verdict.flags.includes('invalid_duration'));
});

test('rejects a forged correct flag when the submitted key is wrong', () => {
  const events = humanTimeline(typedExcerpt);
  events[50] = { ...events[50], key: 'x', correct: true };
  const verdict = scoreAttempt({
    expectedText: passage,
    clientElapsedMs: 60_000,
    serverElapsedMs: 60_100,
    reportedMistakes: 0,
    visibilityChanges: 0,
    events,
  });
  assert.equal(verdict.trustStatus, 'rejected');
  assert.ok(verdict.flags.includes('key_sequence_mismatch'));
});

test('allows an idle tail after the last key before the minute ends', () => {
  const verdict = scoreAttempt({
    expectedText: passage,
    clientElapsedMs: 60_000,
    serverElapsedMs: 60_100,
    reportedMistakes: 0,
    visibilityChanges: 0,
    events: humanTimeline(typedExcerpt, 0, 51_500),
  });
  assert.equal(verdict.trustStatus, 'accepted');
});
