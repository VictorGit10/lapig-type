import assert from 'node:assert/strict';
import test from 'node:test';
import { cosmeticRequirement, DEFAULT_COSMETICS } from '../supabase/functions/_shared/rewards.ts';

test('keeps the base identity available without an achievement', () => {
  assert.equal(cosmeticRequirement('avatar', DEFAULT_COSMETICS.avatar), null);
  assert.equal(cosmeticRequirement('frame', DEFAULT_COSMETICS.frame), null);
  assert.equal(cosmeticRequirement('effect', DEFAULT_COSMETICS.effect), null);
});

test('ties prestige cosmetics to server-verifiable achievements', () => {
  assert.equal(cosmeticRequirement('frame', 'baseline'), 'speed_50');
  assert.equal(cosmeticRequirement('frame', 'zero-mark'), 'top_1');
  assert.equal(cosmeticRequirement('avatar', 'atlas'), 'all_passages_completed');
  assert.equal(cosmeticRequirement('effect', 'solar-pulse'), 'top_1');
});

test('rejects cosmetic keys and slots outside the server allowlist', () => {
  assert.equal(cosmeticRequirement('avatar', 'javascript:alert(1)'), undefined);
  assert.equal(cosmeticRequirement('admin', 'atlas'), undefined);
});
