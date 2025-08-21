ALTER TABLE `search_history` ADD `synced` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `search_history` DROP COLUMN `artwork_url`;--> statement-breakpoint
ALTER TABLE `search_history` DROP COLUMN `artwork_sha256`;