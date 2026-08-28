import assert from 'node:assert/strict';
import test from 'node:test';
import { passages } from '../supabase/functions/_shared/passages.ts';

test('offers six substantial practice passages with stable unique ids', () => {
  assert.equal(passages.length, 6);
  assert.equal(new Set(passages.map((passage) => passage.id)).size, passages.length);
  for (const passage of passages) {
    assert.ok(passage.text.split(/\s+/u).length >= 100, `${passage.id} is too short for a one-minute challenge`);
  }
});

test('keeps two passages from each of the three supplied publications', () => {
  const passagesPerPublication = new Map<string, number>();
  for (const passage of passages) {
    passagesPerPublication.set(passage.sourceUrl, (passagesPerPublication.get(passage.sourceUrl) ?? 0) + 1);
  }
  assert.deepEqual([...passagesPerPublication.values()], [2, 2, 2]);
});
