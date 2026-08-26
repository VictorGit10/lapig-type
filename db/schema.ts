import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const attempts = sqliteTable('attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  passageId: text('passage_id').notNull(),
  passageVersion: integer('passage_version').notNull().default(1),
  expectedChars: integer('expected_chars').notNull(),
  startedAt: integer('started_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
  finishedAt: integer('finished_at'),
  status: text('status', { enum: ['started', 'finished', 'expired'] }).notNull().default('started'),
  clientHash: text('client_hash').notNull(),
}, (table) => [
  index('idx_attempts_user_started').on(table.userId, table.startedAt),
  index('idx_attempts_status_expires').on(table.status, table.expiresAt),
]);

export const results = sqliteTable('results', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').notNull(),
  userId: text('user_id').notNull(),
  passageId: text('passage_id').notNull(),
  grossWpm: integer('gross_wpm').notNull(),
  accuracy: integer('accuracy').notNull(),
  score: integer('score').notNull(),
  durationMs: integer('duration_ms').notNull(),
  mistakeCount: integer('mistake_count').notNull(),
  trustStatus: text('trust_status', { enum: ['accepted', 'review', 'rejected'] }).notNull(),
  flags: text('flags').notNull().default('[]'),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_results_attempt_unique').on(table.attemptId),
  index('idx_results_trust_score').on(table.trustStatus, table.score),
  index('idx_results_user_score').on(table.userId, table.score),
]);
