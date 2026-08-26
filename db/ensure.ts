import { env } from 'cloudflare:workers';

let schemaPromise: Promise<void> | null = null;

export function ensureSchema() {
  schemaPromise ??= initializeSchema();
  return schemaPromise;
}

async function initializeSchema() {
  const d1 = env.DB;
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      passage_id TEXT NOT NULL,
      passage_version INTEGER DEFAULT 1 NOT NULL,
      expected_chars INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      finished_at INTEGER,
      status TEXT DEFAULT 'started' NOT NULL,
      client_hash TEXT NOT NULL
    )`),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_attempts_user_started ON attempts (user_id, started_at)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_attempts_status_expires ON attempts (status, expires_at)'),
    d1.prepare(`CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY NOT NULL,
      attempt_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      passage_id TEXT NOT NULL,
      gross_wpm INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      score INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      mistake_count INTEGER NOT NULL,
      trust_status TEXT NOT NULL,
      flags TEXT DEFAULT '[]' NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    d1.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_results_attempt_unique ON results (attempt_id)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_results_trust_score ON results (trust_status, score DESC)'),
    d1.prepare('CREATE INDEX IF NOT EXISTS idx_results_user_score ON results (user_id, score DESC)'),
  ]);
  await d1.prepare('PRAGMA optimize').run();
}
