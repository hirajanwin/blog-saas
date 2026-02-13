CREATE TABLE `ai_briefs` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`post_id` text,
	`keyword` text NOT NULL,
	`target_word_count` integer DEFAULT 1500,
	`tone` text,
	`structure` text,
	`key_points` text,
	`sources` text,
	`competitor_urls` text,
	`brief_content` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_images` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`post_id` text,
	`prompt` text NOT NULL,
	`negative_prompt` text,
	`model` text,
	`image_url` text NOT NULL,
	`thumbnail_url` text,
	`width` integer,
	`height` integer,
	`style` text,
	`status` text DEFAULT 'completed',
	`credits_used` integer DEFAULT 1,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`blog_id` text,
	`post_id` text,
	`event_type` text NOT NULL,
	`session_id` text,
	`user_id` text,
	`url` text,
	`referrer` text,
	`device` text,
	`browser` text,
	`os` text,
	`country` text,
	`metadata` text,
	`timestamp` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`prefix` text NOT NULL,
	`permissions` text NOT NULL,
	`rate_limit` integer DEFAULT 100,
	`last_used_at` text,
	`expires_at` text,
	`active` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_unique` ON `api_keys` (`key`);--> statement-breakpoint
CREATE TABLE `email_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_id` text NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft',
	`recipient_count` integer DEFAULT 0,
	`sent_count` integer DEFAULT 0,
	`open_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	`unsubscribed_count` integer DEFAULT 0,
	`scheduled_at` text,
	`sent_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gated_content` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`access_tier` text NOT NULL,
	`teaser_content` text,
	`lock_content` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `media_files` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`blog_id` text,
	`filename` text NOT NULL,
	`original_url` text NOT NULL,
	`optimized_url` text,
	`thumbnail_url` text,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt_text` text,
	`caption` text,
	`optimized` integer DEFAULT false,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `member_auth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `member_content_access` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`post_id` text NOT NULL,
	`accessed_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`password_hash` text,
	`membership_tier` text DEFAULT 'free',
	`membership_status` text DEFAULT 'active',
	`stripe_customer_id` text,
	`polar_customer_id` text,
	`subscription_id` text,
	`subscription_end_date` text,
	`metadata` text,
	`email_verified` integer DEFAULT false,
	`last_login_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`status` text DEFAULT 'active',
	`source` text,
	`tags` text,
	`subscribed_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`unsubscribed_at` text,
	`last_email_sent_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `repurposed_content` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`original_post_id` text NOT NULL,
	`platform` text NOT NULL,
	`content` text NOT NULL,
	`media_urls` text,
	`status` text DEFAULT 'draft',
	`scheduled_at` text,
	`published_at` text,
	`platform_post_url` text,
	`engagement` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`original_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `social_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`platform` text NOT NULL,
	`account_id` text NOT NULL,
	`account_name` text,
	`access_token` text,
	`refresh_token` text,
	`token_expires_at` text,
	`profile_image` text,
	`default 0` integer,
	`active` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `social_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`post_id` text,
	`platform` text NOT NULL,
	`content` text NOT NULL,
	`media_urls` text,
	`status` text DEFAULT 'pending',
	`scheduled_at` text,
	`published_at` text,
	`platform_post_id` text,
	`platform_post_url` text,
	`engagement` text,
	`error_message` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `title_tests` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`title` text NOT NULL,
	`variant` text,
	`impressions` integer DEFAULT 0,
	`clicks` integer DEFAULT 0,
	`ctr` real DEFAULT 0,
	`winner` integer DEFAULT false,
	`status` text DEFAULT 'running',
	`started_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	`ended_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`webhook_id` text NOT NULL,
	`event` text NOT NULL,
	`payload` text,
	`response_status` integer,
	`response_body` text,
	`duration` integer,
	`success` integer DEFAULT false,
	`error_message` text,
	`triggered_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`events` text NOT NULL,
	`secret` text,
	`active` integer DEFAULT true,
	`last_triggered_at` text,
	`failure_count` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`blog_id` text,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`embed_code` text,
	`active` integer DEFAULT true,
	`usage_count` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.001Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agency_billing` (
	`id` text PRIMARY KEY NOT NULL,
	`agency_id` text NOT NULL,
	`client_id` text NOT NULL,
	`billing_period` text NOT NULL,
	`total_revenue` integer NOT NULL,
	`polar_fees` integer NOT NULL,
	`agency_profit` integer NOT NULL,
	`profit_margin_percent` integer,
	`status` text DEFAULT 'pending',
	`paid_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`agency_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `agency_clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_agency_billing`("id", "agency_id", "client_id", "billing_period", "total_revenue", "polar_fees", "agency_profit", "profit_margin_percent", "status", "paid_at", "created_at", "updated_at") SELECT "id", "agency_id", "client_id", "billing_period", "total_revenue", "polar_fees", "agency_profit", "profit_margin_percent", "status", "paid_at", "created_at", "updated_at" FROM `agency_billing`;--> statement-breakpoint
DROP TABLE `agency_billing`;--> statement-breakpoint
ALTER TABLE `__new_agency_billing` RENAME TO `agency_billing`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_agency_bulk_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`agency_id` text NOT NULL,
	`operation_type` text NOT NULL,
	`status` text DEFAULT 'pending',
	`progress` integer DEFAULT 0,
	`total_items` integer,
	`completed_items` integer DEFAULT 0,
	`settings` text,
	`results` text,
	`error_message` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`agency_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_agency_bulk_operations`("id", "agency_id", "operation_type", "status", "progress", "total_items", "completed_items", "settings", "results", "error_message", "started_at", "completed_at", "created_at") SELECT "id", "agency_id", "operation_type", "status", "progress", "total_items", "completed_items", "settings", "results", "error_message", "started_at", "completed_at", "created_at" FROM `agency_bulk_operations`;--> statement-breakpoint
DROP TABLE `agency_bulk_operations`;--> statement-breakpoint
ALTER TABLE `__new_agency_bulk_operations` RENAME TO `agency_bulk_operations`;--> statement-breakpoint
CREATE TABLE `__new_agency_clients` (
	`id` text PRIMARY KEY NOT NULL,
	`agency_id` text NOT NULL,
	`client_name` text NOT NULL,
	`client_email` text NOT NULL,
	`client_phone` text,
	`client_company` text,
	`status` text DEFAULT 'active',
	`monthly_fee` integer,
	`notes` text,
	`metadata` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`agency_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_agency_clients`("id", "agency_id", "client_name", "client_email", "client_phone", "client_company", "status", "monthly_fee", "notes", "metadata", "created_at", "updated_at") SELECT "id", "agency_id", "client_name", "client_email", "client_phone", "client_company", "status", "monthly_fee", "notes", "metadata", "created_at", "updated_at" FROM `agency_clients`;--> statement-breakpoint
DROP TABLE `agency_clients`;--> statement-breakpoint
ALTER TABLE `__new_agency_clients` RENAME TO `agency_clients`;--> statement-breakpoint
CREATE TABLE `__new_ai_generated_images` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`prompt` text NOT NULL,
	`image_url` text,
	`alt_text` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ai_generated_images`("id", "post_id", "prompt", "image_url", "alt_text", "created_at") SELECT "id", "post_id", "prompt", "image_url", "alt_text", "created_at" FROM `ai_generated_images`;--> statement-breakpoint
DROP TABLE `ai_generated_images`;--> statement-breakpoint
ALTER TABLE `__new_ai_generated_images` RENAME TO `ai_generated_images`;--> statement-breakpoint
CREATE TABLE `__new_ai_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`type` text,
	`suggestions` text,
	`applied` integer DEFAULT false,
	`created_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ai_suggestions`("id", "post_id", "type", "suggestions", "applied", "created_at") SELECT "id", "post_id", "type", "suggestions", "applied", "created_at" FROM `ai_suggestions`;--> statement-breakpoint
DROP TABLE `ai_suggestions`;--> statement-breakpoint
ALTER TABLE `__new_ai_suggestions` RENAME TO `ai_suggestions`;--> statement-breakpoint
CREATE TABLE `__new_blogs` (
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
	`created_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_blogs`("id", "team_id", "title", "description", "default_language", "languages", "default_og_image", "theme_settings", "seo_settings", "ai_settings", "custom_css", "created_at") SELECT "id", "team_id", "title", "description", "default_language", "languages", "default_og_image", "theme_settings", "seo_settings", "ai_settings", "custom_css", "created_at" FROM `blogs`;--> statement-breakpoint
DROP TABLE `blogs`;--> statement-breakpoint
ALTER TABLE `__new_blogs` RENAME TO `blogs`;--> statement-breakpoint
CREATE TABLE `__new_client_team_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`team_id` text NOT NULL,
	`role` text DEFAULT 'client',
	`permissions` text,
	`assigned_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`client_id`) REFERENCES `agency_clients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_client_team_assignments`("id", "client_id", "team_id", "role", "permissions", "assigned_at") SELECT "id", "client_id", "team_id", "role", "permissions", "assigned_at" FROM `client_team_assignments`;--> statement-breakpoint
DROP TABLE `client_team_assignments`;--> statement-breakpoint
ALTER TABLE `__new_client_team_assignments` RENAME TO `client_team_assignments`;--> statement-breakpoint
CREATE TABLE `__new_competitor_analysis` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`competitor_domain` text NOT NULL,
	`keyword` text NOT NULL,
	`competitor_position` integer NOT NULL,
	`our_position` integer,
	`competitor_url` text,
	`gap_opportunity` integer,
	`analysis_date` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_competitor_analysis`("id", "team_id", "competitor_domain", "keyword", "competitor_position", "our_position", "competitor_url", "gap_opportunity", "analysis_date") SELECT "id", "team_id", "competitor_domain", "keyword", "competitor_position", "our_position", "competitor_url", "gap_opportunity", "analysis_date" FROM `competitor_analysis`;--> statement-breakpoint
DROP TABLE `competitor_analysis`;--> statement-breakpoint
ALTER TABLE `__new_competitor_analysis` RENAME TO `competitor_analysis`;--> statement-breakpoint
CREATE TABLE `__new_content_sync` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`platform` text,
	`external_id` text,
	`status` text DEFAULT 'pending',
	`last_synced_at` text,
	`error_message` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_content_sync`("id", "post_id", "platform", "external_id", "status", "last_synced_at", "error_message", "created_at") SELECT "id", "post_id", "platform", "external_id", "status", "last_synced_at", "error_message", "created_at" FROM `content_sync`;--> statement-breakpoint
DROP TABLE `content_sync`;--> statement-breakpoint
ALTER TABLE `__new_content_sync` RENAME TO `content_sync`;--> statement-breakpoint
CREATE TABLE `__new_content_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`assigned_to` text,
	`assigned_by` text,
	`task_type` text,
	`description` text,
	`status` text DEFAULT 'pending',
	`due_date` text,
	`completed_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_content_tasks`("id", "post_id", "assigned_to", "assigned_by", "task_type", "description", "status", "due_date", "completed_at", "created_at") SELECT "id", "post_id", "assigned_to", "assigned_by", "task_type", "description", "status", "due_date", "completed_at", "created_at" FROM `content_tasks`;--> statement-breakpoint
DROP TABLE `content_tasks`;--> statement-breakpoint
ALTER TABLE `__new_content_tasks` RENAME TO `content_tasks`;--> statement-breakpoint
CREATE TABLE `__new_faq_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`position` integer,
	`schema_enabled` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_faq_sections`("id", "post_id", "question", "answer", "position", "schema_enabled", "created_at") SELECT "id", "post_id", "question", "answer", "position", "schema_enabled", "created_at" FROM `faq_sections`;--> statement-breakpoint
DROP TABLE `faq_sections`;--> statement-breakpoint
ALTER TABLE `__new_faq_sections` RENAME TO `faq_sections`;--> statement-breakpoint
CREATE TABLE `__new_internal_links` (
	`id` text PRIMARY KEY NOT NULL,
	`from_post_id` text,
	`to_post_id` text,
	`anchor_text` text,
	`relevance_score` integer,
	`created_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	`applied` integer DEFAULT false,
	FOREIGN KEY (`from_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_internal_links`("id", "from_post_id", "to_post_id", "anchor_text", "relevance_score", "created_at", "applied") SELECT "id", "from_post_id", "to_post_id", "anchor_text", "relevance_score", "created_at", "applied" FROM `internal_links`;--> statement-breakpoint
DROP TABLE `internal_links`;--> statement-breakpoint
ALTER TABLE `__new_internal_links` RENAME TO `internal_links`;--> statement-breakpoint
CREATE TABLE `__new_keyword_rankings` (
	`id` text PRIMARY KEY NOT NULL,
	`keyword_id` text NOT NULL,
	`post_id` text,
	`url` text NOT NULL,
	`position` integer NOT NULL,
	`search_engine` text DEFAULT 'google',
	`location` text,
	`device` text DEFAULT 'desktop',
	`tracked_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`keyword_id`) REFERENCES `keywords`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_keyword_rankings`("id", "keyword_id", "post_id", "url", "position", "search_engine", "location", "device", "tracked_at") SELECT "id", "keyword_id", "post_id", "url", "position", "search_engine", "location", "device", "tracked_at" FROM `keyword_rankings`;--> statement-breakpoint
DROP TABLE `keyword_rankings`;--> statement-breakpoint
ALTER TABLE `__new_keyword_rankings` RENAME TO `keyword_rankings`;--> statement-breakpoint
CREATE TABLE `__new_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`keyword` text NOT NULL,
	`difficulty` integer,
	`volume` integer,
	`intent` text,
	`team_id` text,
	`created_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_keywords`("id", "keyword", "difficulty", "volume", "intent", "team_id", "created_at") SELECT "id", "keyword", "difficulty", "volume", "intent", "team_id", "created_at" FROM `keywords`;--> statement-breakpoint
DROP TABLE `keywords`;--> statement-breakpoint
ALTER TABLE `__new_keywords` RENAME TO `keywords`;--> statement-breakpoint
CREATE TABLE `__new_lead_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_id` text,
	`name` text NOT NULL,
	`type` text,
	`settings` text,
	`active` integer DEFAULT true,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_lead_forms`("id", "blog_id", "name", "type", "settings", "active", "created_at") SELECT "id", "blog_id", "name", "type", "settings", "active", "created_at" FROM `lead_forms`;--> statement-breakpoint
DROP TABLE `lead_forms`;--> statement-breakpoint
ALTER TABLE `__new_lead_forms` RENAME TO `lead_forms`;--> statement-breakpoint
CREATE TABLE `__new_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text,
	`post_id` text,
	`email` text NOT NULL,
	`name` text,
	`data` text,
	`source` text,
	`converted_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`form_id`) REFERENCES `lead_forms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_leads`("id", "form_id", "post_id", "email", "name", "data", "source", "converted_at") SELECT "id", "form_id", "post_id", "email", "name", "data", "source", "converted_at" FROM `leads`;--> statement-breakpoint
DROP TABLE `leads`;--> statement-breakpoint
ALTER TABLE `__new_leads` RENAME TO `leads`;--> statement-breakpoint
CREATE TABLE `__new_page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`ip_address` text,
	`user_agent` text,
	`referrer` text,
	`viewed_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_page_views`("id", "post_id", "ip_address", "user_agent", "referrer", "viewed_at") SELECT "id", "post_id", "ip_address", "user_agent", "referrer", "viewed_at" FROM `page_views`;--> statement-breakpoint
DROP TABLE `page_views`;--> statement-breakpoint
ALTER TABLE `__new_page_views` RENAME TO `page_views`;--> statement-breakpoint
CREATE TABLE `__new_polar_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`polar_customer_id` text NOT NULL,
	`team_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`metadata` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_polar_customers`("id", "polar_customer_id", "team_id", "email", "name", "metadata", "created_at", "updated_at") SELECT "id", "polar_customer_id", "team_id", "email", "name", "metadata", "created_at", "updated_at" FROM `polar_customers`;--> statement-breakpoint
DROP TABLE `polar_customers`;--> statement-breakpoint
ALTER TABLE `__new_polar_customers` RENAME TO `polar_customers`;--> statement-breakpoint
CREATE UNIQUE INDEX `polar_customers_polar_customer_id_unique` ON `polar_customers` (`polar_customer_id`);--> statement-breakpoint
CREATE TABLE `__new_polar_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`polar_order_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`polar_product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`status` text NOT NULL,
	`amount` integer,
	`currency` text DEFAULT 'usd',
	`metadata` text,
	`paid_at` text,
	`refunded_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`customer_id`) REFERENCES `polar_customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_polar_orders`("id", "polar_order_id", "customer_id", "polar_product_id", "product_name", "status", "amount", "currency", "metadata", "paid_at", "refunded_at", "created_at", "updated_at") SELECT "id", "polar_order_id", "customer_id", "polar_product_id", "product_name", "status", "amount", "currency", "metadata", "paid_at", "refunded_at", "created_at", "updated_at" FROM `polar_orders`;--> statement-breakpoint
DROP TABLE `polar_orders`;--> statement-breakpoint
ALTER TABLE `__new_polar_orders` RENAME TO `polar_orders`;--> statement-breakpoint
CREATE UNIQUE INDEX `polar_orders_polar_order_id_unique` ON `polar_orders` (`polar_order_id`);--> statement-breakpoint
CREATE TABLE `__new_polar_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`polar_subscription_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`polar_product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`status` text NOT NULL,
	`current_period_start` text NOT NULL,
	`current_period_end` text NOT NULL,
	`cancel_at_period_end` integer DEFAULT false,
	`amount` integer,
	`currency` text DEFAULT 'usd',
	`metadata` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`customer_id`) REFERENCES `polar_customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_polar_subscriptions`("id", "polar_subscription_id", "customer_id", "polar_product_id", "product_name", "status", "current_period_start", "current_period_end", "cancel_at_period_end", "amount", "currency", "metadata", "created_at", "updated_at") SELECT "id", "polar_subscription_id", "customer_id", "polar_product_id", "product_name", "status", "current_period_start", "current_period_end", "cancel_at_period_end", "amount", "currency", "metadata", "created_at", "updated_at" FROM `polar_subscriptions`;--> statement-breakpoint
DROP TABLE `polar_subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_polar_subscriptions` RENAME TO `polar_subscriptions`;--> statement-breakpoint
CREATE UNIQUE INDEX `polar_subscriptions_polar_subscription_id_unique` ON `polar_subscriptions` (`polar_subscription_id`);--> statement-breakpoint
CREATE TABLE `__new_post_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`user_id` text,
	`comment` text NOT NULL,
	`position` text,
	`resolved` integer DEFAULT false,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_post_comments`("id", "post_id", "user_id", "comment", "position", "resolved", "created_at") SELECT "id", "post_id", "user_id", "comment", "position", "resolved", "created_at" FROM `post_comments`;--> statement-breakpoint
DROP TABLE `post_comments`;--> statement-breakpoint
ALTER TABLE `__new_post_comments` RENAME TO `post_comments`;--> statement-breakpoint
CREATE TABLE `__new_posts` (
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
	`created_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "blog_id", "title", "slug", "content", "excerpt", "language", "status", "seo_score", "readability_score", "meta_title", "meta_description", "og_image", "canonical_url", "focus_keyword", "secondary_keywords", "schema_types", "ai_outline", "ai_suggestions", "target_word_count", "reading_time", "published_at", "scheduled_at", "author_id", "views", "unique_views", "avg_time_on_page", "created_at", "updated_at") SELECT "id", "blog_id", "title", "slug", "content", "excerpt", "language", "status", "seo_score", "readability_score", "meta_title", "meta_description", "og_image", "canonical_url", "focus_keyword", "secondary_keywords", "schema_types", "ai_outline", "ai_suggestions", "target_word_count", "reading_time", "published_at", "scheduled_at", "author_id", "views", "unique_views", "avg_time_on_page", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
CREATE TABLE `__new_seo_automation_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`post_id` text,
	`task_type` text NOT NULL,
	`priority` text DEFAULT 'medium',
	`title` text NOT NULL,
	`description` text,
	`impact` integer,
	`effort` integer,
	`status` text DEFAULT 'pending',
	`automated` integer DEFAULT false,
	`completed_at` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_seo_automation_tasks`("id", "team_id", "post_id", "task_type", "priority", "title", "description", "impact", "effort", "status", "automated", "completed_at", "created_at") SELECT "id", "team_id", "post_id", "task_type", "priority", "title", "description", "impact", "effort", "status", "automated", "completed_at", "created_at" FROM `seo_automation_tasks`;--> statement-breakpoint
DROP TABLE `seo_automation_tasks`;--> statement-breakpoint
ALTER TABLE `__new_seo_automation_tasks` RENAME TO `seo_automation_tasks`;--> statement-breakpoint
CREATE TABLE `__new_seo_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`meta_title` text,
	`meta_description` text,
	`og_image` text,
	`seo_score` integer DEFAULT 0,
	`canonical_url` text,
	`updated_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_seo_metadata`("id", "post_id", "meta_title", "meta_description", "og_image", "seo_score", "canonical_url", "updated_at") SELECT "id", "post_id", "meta_title", "meta_description", "og_image", "seo_score", "canonical_url", "updated_at" FROM `seo_metadata`;--> statement-breakpoint
DROP TABLE `seo_metadata`;--> statement-breakpoint
ALTER TABLE `__new_seo_metadata` RENAME TO `seo_metadata`;--> statement-breakpoint
CREATE UNIQUE INDEX `seo_metadata_post_id_unique` ON `seo_metadata` (`post_id`);--> statement-breakpoint
CREATE TABLE `__new_seo_performance` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`post_id` text,
	`date` text NOT NULL,
	`organic_clicks` integer DEFAULT 0,
	`organic_impressions` integer DEFAULT 0,
	`organic_ctr` real,
	`avg_position` real,
	`backlinks` integer DEFAULT 0,
	`referring_domains` integer DEFAULT 0,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_seo_performance`("id", "team_id", "post_id", "date", "organic_clicks", "organic_impressions", "organic_ctr", "avg_position", "backlinks", "referring_domains", "created_at") SELECT "id", "team_id", "post_id", "date", "organic_clicks", "organic_impressions", "organic_ctr", "avg_position", "backlinks", "referring_domains", "created_at" FROM `seo_performance`;--> statement-breakpoint
DROP TABLE `seo_performance`;--> statement-breakpoint
ALTER TABLE `__new_seo_performance` RENAME TO `seo_performance`;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subdomain` text,
	`custom_domain` text,
	`plan_type` text DEFAULT 'free',
	`ai_credits_monthly` integer DEFAULT 100,
	`settings` text,
	`created_at` text DEFAULT '2026-02-12T20:03:05.998Z'
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "name", "subdomain", "custom_domain", "plan_type", "ai_credits_monthly", "settings", "created_at") SELECT "id", "name", "subdomain", "custom_domain", "plan_type", "ai_credits_monthly", "settings", "created_at" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
CREATE UNIQUE INDEX `teams_subdomain_unique` ON `teams` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_custom_domain_unique` ON `teams` (`custom_domain`);--> statement-breakpoint
CREATE TABLE `__new_usage_tracking` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`subscription_id` text,
	`metric` text NOT NULL,
	`quantity` integer NOT NULL,
	`period` text NOT NULL,
	`recorded_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscription_id`) REFERENCES `polar_subscriptions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_usage_tracking`("id", "team_id", "subscription_id", "metric", "quantity", "period", "recorded_at") SELECT "id", "team_id", "subscription_id", "metric", "quantity", "period", "recorded_at" FROM `usage_tracking`;--> statement-breakpoint
DROP TABLE `usage_tracking`;--> statement-breakpoint
ALTER TABLE `__new_usage_tracking` RENAME TO `usage_tracking`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`role` text DEFAULT 'author',
	`team_id` text,
	`preferences` text,
	`created_at` text DEFAULT '2026-02-12T20:03:05.999Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "name", "avatar_url", "role", "team_id", "preferences", "created_at") SELECT "id", "email", "name", "avatar_url", "role", "team_id", "preferences", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_white_label_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`logo_url` text,
	`favicon_url` text,
	`primary_color` text,
	`secondary_color` text,
	`accent_color` text,
	`custom_css` text,
	`custom_domain` text,
	`remove_polar_branding` integer DEFAULT false,
	`custom_footer_html` text,
	`custom_header_html` text,
	`email_settings` text,
	`created_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	`updated_at` text DEFAULT '2026-02-12T20:03:06.000Z',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_white_label_settings`("id", "team_id", "logo_url", "favicon_url", "primary_color", "secondary_color", "accent_color", "custom_css", "custom_domain", "remove_polar_branding", "custom_footer_html", "custom_header_html", "email_settings", "created_at", "updated_at") SELECT "id", "team_id", "logo_url", "favicon_url", "primary_color", "secondary_color", "accent_color", "custom_css", "custom_domain", "remove_polar_branding", "custom_footer_html", "custom_header_html", "email_settings", "created_at", "updated_at" FROM `white_label_settings`;--> statement-breakpoint
DROP TABLE `white_label_settings`;--> statement-breakpoint
ALTER TABLE `__new_white_label_settings` RENAME TO `white_label_settings`;--> statement-breakpoint
CREATE UNIQUE INDEX `white_label_settings_team_id_unique` ON `white_label_settings` (`team_id`);