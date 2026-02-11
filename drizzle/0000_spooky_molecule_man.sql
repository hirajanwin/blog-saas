CREATE TABLE `ai_generated_images` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`prompt` text NOT NULL,
	`image_url` text,
	`alt_text` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.248Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`type` text,
	`suggestions` text,
	`applied` integer DEFAULT false,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blogs` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`default_language` text DEFAULT 'en',
	`languages` text,
	`default_og_image` text,
	`theme_settings` text,
	`seo_settings` text,
	`ai_settings` text,
	`custom_css` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `content_sync` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`platform` text,
	`external_id` text,
	`status` text DEFAULT 'pending',
	`last_synced_at` text,
	`error_message` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.248Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `content_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`assigned_to` text,
	`assigned_by` text,
	`task_type` text,
	`description` text,
	`status` text DEFAULT 'pending',
	`due_date` text,
	`completed_at` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.248Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `faq_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`position` integer,
	`schema_enabled` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `internal_links` (
	`id` text PRIMARY KEY NOT NULL,
	`from_post_id` text,
	`to_post_id` text,
	`anchor_text` text,
	`relevance_score` integer,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	`applied` integer DEFAULT false,
	FOREIGN KEY (`from_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`keyword` text NOT NULL,
	`difficulty` integer,
	`volume` integer,
	`intent` text,
	`team_id` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lead_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_id` text,
	`name` text NOT NULL,
	`type` text,
	`settings` text,
	`active` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-11T19:02:05.248Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text,
	`post_id` text,
	`email` text NOT NULL,
	`name` text,
	`data` text,
	`source` text,
	`converted_at` text DEFAULT '2026-02-11T19:02:05.248Z',
	FOREIGN KEY (`form_id`) REFERENCES `lead_forms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`ip_address` text,
	`user_agent` text,
	`referrer` text,
	`viewed_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `post_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`user_id` text,
	`comment` text NOT NULL,
	`position` text,
	`resolved` integer DEFAULT false,
	`created_at` text DEFAULT '2026-02-11T19:02:05.248Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`keyword_id` text,
	`is_primary` integer DEFAULT false,
	`position` integer,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`keyword_id`) REFERENCES `keywords`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`language` text DEFAULT 'en',
	`status` text DEFAULT 'draft',
	`seo_score` integer DEFAULT 0,
	`readability_score` integer DEFAULT 0,
	`meta_title` text,
	`meta_description` text,
	`og_image` text,
	`canonical_url` text,
	`focus_keyword` text,
	`secondary_keywords` text,
	`schema_types` text,
	`ai_outline` text,
	`ai_suggestions` text,
	`target_word_count` integer,
	`reading_time` integer,
	`published_at` text,
	`scheduled_at` text,
	`author_id` text,
	`views` integer DEFAULT 0,
	`unique_views` integer DEFAULT 0,
	`avg_time_on_page` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	`updated_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `seo_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`meta_title` text,
	`meta_description` text,
	`og_image` text,
	`seo_score` integer DEFAULT 0,
	`canonical_url` text,
	`updated_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seo_metadata_post_id_unique` ON `seo_metadata` (`post_id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subdomain` text,
	`custom_domain` text,
	`plan_type` text DEFAULT 'free',
	`ai_credits_monthly` integer DEFAULT 100,
	`settings` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.246Z'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_subdomain_unique` ON `teams` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_custom_domain_unique` ON `teams` (`custom_domain`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`role` text DEFAULT 'author',
	`team_id` text,
	`preferences` text,
	`created_at` text DEFAULT '2026-02-11T19:02:05.247Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);