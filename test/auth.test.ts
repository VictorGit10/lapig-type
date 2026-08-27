import assert from 'node:assert/strict';
import test from 'node:test';
import { accountEmail, authFailureMessage, normalizeDisplayName, normalizeUsername } from '../app/lib/supabase-browser.ts';

test('normalizes a public username into a stable internal account identifier', () => {
  assert.equal(normalizeUsername(' Ana.Cerrado '), 'ana.cerrado');
  assert.equal(accountEmail(normalizeUsername(' Ana.Cerrado ')), 'ana.cerrado@users.victorgit10.github.io');
  assert.equal(normalizeDisplayName('  Victor   Amaral  '), 'Victor Amaral');
  assert.equal(normalizeUsername('Victor Amaral'), 'victor.amaral');
  assert.equal(normalizeUsername('João Silva'), 'joao.silva');
});

test('rejects usernames that could produce ambiguous account identifiers', () => {
  for (const username of ['ab', '.inicio', 'com@arroba', 'nome.', 'a'.repeat(33)]) {
    assert.throws(() => normalizeUsername(username), /invalid_username/);
  }
});

test('explains when a requested username is already in use', () => {
  assert.equal(
    authFailureMessage({ code: 'user_already_exists' }, 'signup'),
    'Esse nome de usuário já está em uso. Tente entrar ou escolha outro nome.',
  );
  assert.match(authFailureMessage(new Error('user_already_exists'), 'signup'), /já está em uso/);
});
