import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Teams table for multi-tenancy
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subdomain: text('subdomain').unique(),
  customDomain: text('custom_domain').unique(),
  planType: text('plan_type').default('free'), // free, pro, enterprise
  aiCreditsMonthly: integer('ai_credits_monthly').default(100),
  settings: text('settings'), // JSON string for theme, SEO defaults, automation settings
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Users table with roles and permissions
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('author'), // admin, editor, author, viewer
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  preferences: text('preferences'), // JSON string for editor preferences, notification settings
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Blogs table for individual blog sites
export const blogs = sqliteTable('blogs', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  defaultLanguage: text('default_language').default('en'),
  languages: text('languages'), // JSON array ["en", "es", "fr"]
  defaultOgImage: text('default_og_image'),
  themeSettings: text('theme_settings'), // JSON string
  seoSettings: text('seo_settings'), // JSON string for meta defaults, schema settings
  aiSettings: text('ai_settings'), // JSON string for tone, style preferences
  customCss: text('custom_css'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Posts table with comprehensive content management
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content').notNull(), // JSON string for Tiptap document
  excerpt: text('excerpt'),
  language: text('language').default('en'),
  status: text('status').default('draft'), // draft, reviewing, scheduled, published
  seoScore: integer('seo_score').default(0), // 0-100 SEO score
  readabilityScore: integer('readability_score').default(0), // 0-100 readability

  // SEO metadata
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  canonicalUrl: text('canonical_url'),
  focusKeyword: text('focus_keyword'),
  secondaryKeywords: text('secondary_keywords'), // JSON array
  schemaTypes: text('schema_types'), // JSON array ["BlogPosting", "FAQPage"]

  // AI optimization
  aiOutline: text('ai_outline'), // JSON string for AI-generated outline
  aiSuggestions: text('ai_suggestions'), // JSON string for AI improvement suggestions
  targetWordCount: integer('target_word_count'),
  readingTime: integer('reading_time'), // minutes

  // Publishing
  publishedAt: text('published_at'),
  scheduledAt: text('scheduled_at'),
  authorId: text('author_id').references(() => users.id),

  // Analytics
  views: integer('views').default(0),
  uniqueViews: integer('unique_views').default(0),
  avgTimeOnPage: integer('avg_time_on_page').default(0), // seconds

  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// SEO metadata for posts
export const seoMetadata = sqliteTable('seo_metadata', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }).unique(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  seoScore: integer('seo_score').default(0),
  canonicalUrl: text('canonical_url'),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Page views for analytics (privacy-friendly)
export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  viewedAt: text('viewed_at').default(new Date().toISOString()),
});

// Internal linking suggestions
export const internalLinks = sqliteTable('internal_links', {
  id: text('id').primaryKey(),
  fromPostId: text('from_post_id').references(() => posts.id, { onDelete: 'cascade' }),
  toPostId: text('to_post_id').references(() => posts.id, { onDelete: 'cascade' }),
  anchorText: text('anchor_text'),
  relevanceScore: integer('relevance_score'), // 0-100
  createdAt: text('created_at').default(new Date().toISOString()),
  applied: integer('applied', { mode: 'boolean' }).default(0),
});

// AI suggestions for content optimization
export const aiSuggestions = sqliteTable('ai_suggestions', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  type: text('type'), // outline, seo, readability, internal_links
  suggestions: text('suggestions'), // JSON string
  applied: integer('applied', { mode: 'boolean' }).default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Keywords for SEO research
export const keywords = sqliteTable('keywords', {
  id: text('id').primaryKey(),
  keyword: text('keyword').notNull(),
  difficulty: integer('difficulty'), // 0-100
  volume: integer('volume'),
  intent: text('intent'), // informational, commercial, transactional
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Post keywords association
export const postKeywords = sqliteTable('post_keywords', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  keywordId: text('keyword_id').references(() => keywords.id, { onDelete: 'cascade' }),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(0),
  position: integer('position'), // keyword position in content
});

// FAQ sections for schema generation
export const faqSections = sqliteTable('faq_sections', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  position: integer('position'),
  schemaEnabled: integer('schema_enabled', { mode: 'boolean' }).default(1),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Team collaboration tasks
export const contentTasks = sqliteTable('content_tasks', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  assignedTo: text('assigned_to').references(() => users.id),
  assignedBy: text('assigned_by').references(() => users.id),
  taskType: text('task_type'), // review, edit, optimize, publish
  description: text('description'),
  status: text('status').default('pending'), // pending, in_progress, completed
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Post comments for collaboration
export const postComments = sqliteTable('post_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  comment: text('comment').notNull(),
  position: text('position'), // JSON string for cursor position in document
  resolved: integer('resolved', { mode: 'boolean' }).default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Lead generation forms
export const leadForms = sqliteTable('lead_forms', {
  id: text('id').primaryKey(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type'), // newsletter, cta, popup, sidebar
  settings: text('settings'), // JSON string for form fields, styling, triggers
  active: integer('active', { mode: 'boolean' }).default(1),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Lead captures
export const leads = sqliteTable('leads', {
  id: text('id').primaryKey(),
  formId: text('form_id').references(() => leadForms.id, { onDelete: 'cascade' }),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  data: text('data'), // JSON string for additional form fields
  source: text('source'), // organic, social, referral, direct
  convertedAt: text('converted_at').default(new Date().toISOString()),
});

// AI-generated images
export const aiGeneratedImages = sqliteTable('ai_generated_images', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  imageUrl: text('image_url'),
  altText: text('alt_text'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Content sync for external platforms
export const contentSync = sqliteTable('content_sync', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  platform: text('platform'), // wordpress, webflow, notion, etc.
  externalId: text('external_id'),
  status: text('status').default('pending'), // pending, synced, error
  lastSyncedAt: text('last_synced_at'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Zod schemas for validation
export const insertTeamSchema = createInsertSchema(teams);
export const selectTeamSchema = createSelectSchema(teams);
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertBlogSchema = createInsertSchema(blogs);
export const selectBlogSchema = createSelectSchema(blogs);
export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);

// Types
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;