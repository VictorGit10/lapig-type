CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`passage_id` text NOT NULL,
	`passage_version` integer DEFAULT 1 NOT NULL,
	`expected_chars` integer NOT NULL,
	`started_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`finished_at` integer,
	`status` text DEFAULT 'started' NOT NULL,
	`client_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_attempts_user_started` ON `attempts` (`user_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `idx_attempts_status_expires` ON `attempts` (`status`,`expires_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`user_id` text NOT NULL,
	`passage_id` text NOT NULL,
	`gross_wpm` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`score` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`mistake_count` integer NOT NULL,
	`trust_status` text NOT NULL,
	`flags` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_results_attempt_unique` ON `results` (`attempt_id`);--> statement-breakpoint
CREATE INDEX `idx_results_trust_score` ON `results` (`trust_status`,`score`);--> statement-breakpoint
CREATE INDEX `idx_results_user_score` ON `results` (`user_id`,`score`);