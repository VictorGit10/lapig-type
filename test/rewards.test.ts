import assert from 'node:assert/strict';
import test from 'node:test';
import { ACHIEVEMENTS } from '../app/rewards.ts';
import { cosmeticRequirement, DEFAULT_COSMETICS, EMPTY_PIXELS, isValidAvatarPixels } from '../supabase/functions/_shared/rewards.ts';

test('keeps the base avatar available without an achievement', () => {
  assert.equal(DEFAULT_COSMETICS.pixels.length, 256);
  assert.equal(cosmeticRequirement('effect', DEFAULT_COSMETICS.effect), null);
});

test('ties every special effect to a server-verifiable achievement', () => {
  assert.equal(cosmeticRequirement('effect', 'signal'), 'speed_50');
  assert.equal(cosmeticRequirement('effect', 'scan'), 'speed_75');
  assert.equal(cosmeticRequirement('effect', 'solar-pulse'), 'top_1');
  assert.equal(cosmeticRequirement('effect', 'atlas'), 'all_passages_completed');
});

test('uses a realistic three-step speed progression', () => {
  const speedCriteria = ACHIEVEMENTS
    .filter((achievement) => achievement.key.startsWith('speed_'))
    .map((achievement) => achievement.criteria.pt);
  assert.deepEqual(speedCriteria, ['Alcance 40 PPM.', 'Alcance 60 PPM.', 'Alcance 90 PPM.']);
});

test('rejects cosmetic keys and slots outside the server allowlist', () => {
  assert.equal(cosmeticRequirement('avatar', 'javascript:alert(1)'), undefined);
  assert.equal(cosmeticRequirement('effect', 'javascript:alert(1)'), undefined);
});

test('accepts only an exact 16x16 grid using allowlisted palette indexes', () => {
  const valid = EMPTY_PIXELS();
  valid[120] = 31;
  assert.equal(isValidAvatarPixels(valid), true);
  assert.equal(isValidAvatarPixels(valid.slice(1)), false);
  assert.equal(isValidAvatarPixels([...valid.slice(0, 120), 32, ...valid.slice(121)]), false);
  assert.equal(isValidAvatarPixels([...valid.slice(0, 120), 1.5, ...valid.slice(121)]), false);
});

test('rejects painted pixels outside the circular avatar mask', () => {
  const invalid = EMPTY_PIXELS();
  invalid[0] = 2;
  assert.equal(isValidAvatarPixels(invalid), false);
});
