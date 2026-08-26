import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreAttempt, type KeystrokeEvent } from '../app/lib/scoring.ts';

function humanTimeline(correctChars: number, mistakes = 0, duration = 60_000): KeystrokeEvent[] {
  const total = correctChars + mistakes;
  const weights = Array.from({ length: total - 1 }, (_, index) => 1 + Math.sin(index * 1.73) * 0.28);
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const deltas = [0, ...weights.map((weight) => Math.round(duration * weight / weightSum))];
  deltas[deltas.length - 1] += duration - deltas.reduce((sum, value) => sum + value, 0);
  return deltas.map((delta, index) => ({
    delta,
    correct: index >= mistakes,
    repeat: false,
  }));
}

test('accepts a plausible complete human timeline', () => {
  const verdict = scoreAttempt({
    expectedChars: 200,
    clientElapsedMs: 60_000,
    serverElapsedMs: 60_250,
    reportedMistakes: 0,
    visibilityChanges: 1,
    events: humanTimeline(200),
  });
  assert.equal(verdict.trustStatus, 'accepted');
  assert.equal(verdict.grossWpm, 40);
  assert.equal(verdict.accuracy, 100);
});

test('penalizes mistakes in the competitive score', () => {
  const verdict = scoreAttempt({
    expectedChars: 200,
    clientElapsedMs: 65_000,
    serverElapsedMs: 65_200,
    reportedMistakes: 10,
    visibilityChanges: 0,
    events: humanTimeline(200, 10, 65_000),
  });
  assert.equal(verdict.trustStatus, 'accepted');
  assert.equal(verdict.accuracy, 95);
  assert.ok(verdict.score < verdict.grossWpm);
});

test('rejects machine-speed bursts', () => {
  const events = Array.from({ length: 400 }, (_, index) => ({ delta: index === 0 ? 0 : 5, correct: true, repeat: false }));
  const verdict = scoreAttempt({
    expectedChars: 400,
    clientElapsedMs: 1_995,
    serverElapsedMs: 2_050,
    reportedMistakes: 0,
    visibilityChanges: 0,
    events,
  });
  assert.equal(verdict.trustStatus, 'rejected');
  assert.ok(verdict.flags.includes('machine_speed_burst'));
});

test('rejects forged clocks and incomplete sequences', () => {
  const verdict = scoreAttempt({
    expectedChars: 200,
    clientElapsedMs: 15_000,
    serverElapsedMs: 60_000,
    reportedMistakes: 0,
    visibilityChanges: 0,
    events: humanTimeline(190, 0, 15_000),
  });
  assert.equal(verdict.trustStatus, 'rejected');
  assert.ok(verdict.flags.includes('clock_mismatch'));
  assert.ok(verdict.flags.includes('incomplete_sequence'));
});
