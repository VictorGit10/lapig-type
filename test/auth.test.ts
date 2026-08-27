import assert from 'node:assert/strict';
import test from 'node:test';
import { accountEmail, normalizeUsername } from '../app/lib/supabase-browser.ts';

test('normalizes a public username into a stable internal account identifier', () => {
  assert.equal(normalizeUsername(' Ana.Cerrado '), 'ana.cerrado');
  assert.equal(accountEmail(normalizeUsername(' Ana.Cerrado ')), 'ana.cerrado@users.victorgit10.github.io');
});

test('rejects usernames that could produce ambiguous account identifiers', () => {
  for (const username of ['ab', '.inicio', 'com espaço', 'com@arroba', 'a'.repeat(25)]) {
    assert.throws(() => normalizeUsername(username), /invalid_username/);
  }
});
