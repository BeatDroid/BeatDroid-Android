CREATE TABLE `search_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`search_type` text NOT NULL,
	`search_param` text NOT NULL,
	`artist_name` text NOT NULL,
	`theme` text DEFAULT 'Dark' NOT NULL,
	`accent_line` integer DEFAULT false NOT NULL,
	`artwork_url` text,
	`artwork_sha256` text,
	`blurhash` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `search_type_idx` ON `search_history` (`search_type`);--> statement-breakpoint
CREATE INDEX `artist_name_idx` ON `search_history` (`artist_name`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `search_history` (`created_at`);