CREATE TABLE `lookup_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`zip` text,
	`created_at` integer NOT NULL,
	`flood` integer DEFAULT false NOT NULL,
	`str` integer DEFAULT false NOT NULL,
	`recovery` integer DEFAULT false NOT NULL,
	`flood_zone` text,
	`str_jurisdiction` text
);
--> statement-breakpoint
CREATE INDEX `lookup_events_zip_idx` ON `lookup_events` (`zip`);--> statement-breakpoint
CREATE INDEX `lookup_events_created_at_idx` ON `lookup_events` (`created_at`);