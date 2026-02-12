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
  applied: integer('applied', { mode: 'boolean' }).default(false),
});

// AI suggestions for content optimization
export const aiSuggestions = sqliteTable('ai_suggestions', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  type: text('type'), // outline, seo, readability, internal_links
  suggestions: text('suggestions'), // JSON string
  applied: integer('applied', { mode: 'boolean' }).default(false),
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
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  position: integer('position'), // keyword position in content
});

// FAQ sections for schema generation
export const faqSections = sqliteTable('faq_sections', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  position: integer('position'),
  schemaEnabled: integer('schema_enabled', { mode: 'boolean' }).default(true),
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
  resolved: integer('resolved', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Lead generation forms
export const leadForms = sqliteTable('lead_forms', {
  id: text('id').primaryKey(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type'), // newsletter, cta, popup, sidebar
  settings: text('settings'), // JSON string for form fields, styling, triggers
  active: integer('active', { mode: 'boolean' }).default(true),
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

// ===== POLAR PAYMENTS & SUBSCRIPTIONS =====

// Polar customers
export const polarCustomers = sqliteTable('polar_customers', {
  id: text('id').primaryKey(),
  polarCustomerId: text('polar_customer_id').unique().notNull(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  name: text('name'),
  metadata: text('metadata'), // JSON string for additional customer data
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Polar subscriptions
export const polarSubscriptions = sqliteTable('polar_subscriptions', {
  id: text('id').primaryKey(),
  polarSubscriptionId: text('polar_subscription_id').unique().notNull(),
  customerId: text('customer_id').references(() => polarCustomers.id, { onDelete: 'cascade' }).notNull(),
  polarProductId: text('polar_product_id').notNull(),
  productName: text('product_name').notNull(),
  status: text('status').notNull(), // active, canceled, trialing, past_due, unpaid
  currentPeriodStart: text('current_period_start').notNull(),
  currentPeriodEnd: text('current_period_end').notNull(),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  amount: integer('amount'), // in cents
  currency: text('currency').default('usd'),
  metadata: text('metadata'), // JSON string for additional subscription data
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Polar orders (one-time payments)
export const polarOrders = sqliteTable('polar_orders', {
  id: text('id').primaryKey(),
  polarOrderId: text('polar_order_id').unique().notNull(),
  customerId: text('customer_id').references(() => polarCustomers.id, { onDelete: 'cascade' }).notNull(),
  polarProductId: text('polar_product_id').notNull(),
  productName: text('product_name').notNull(),
  status: text('status').notNull(), // pending, paid, refunded, canceled
  amount: integer('amount'), // in cents
  currency: text('currency').default('usd'),
  metadata: text('metadata'), // JSON string for additional order data
  paidAt: text('paid_at'),
  refundedAt: text('refunded_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Usage tracking for AI credits and other metered features
export const usageTracking = sqliteTable('usage_tracking', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  subscriptionId: text('subscription_id').references(() => polarSubscriptions.id, { onDelete: 'set null' }),
  metric: text('metric').notNull(), // ai_credits, api_calls, storage_gb, custom_domains
  quantity: integer('quantity').notNull(),
  period: text('period').notNull(), // YYYY-MM format for monthly periods
  recordedAt: text('recorded_at').default(new Date().toISOString()),
});

// ===== SEO AUTOMATION SUITE =====

// Keyword rank tracking
export const keywordRankings = sqliteTable('keyword_rankings', {
  id: text('id').primaryKey(),
  keywordId: text('keyword_id').references(() => keywords.id, { onDelete: 'cascade' }).notNull(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  position: integer('position').notNull(), // 1-100+
  searchEngine: text('search_engine').default('google'), // google, bing, duckduckgo
  location: text('location'), // country/region for localized results
  device: text('device').default('desktop'), // desktop, mobile
  trackedAt: text('tracked_at').default(new Date().toISOString()),
});

// Competitor analysis
export const competitorAnalysis = sqliteTable('competitor_analysis', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  competitorDomain: text('competitor_domain').notNull(),
  keyword: text('keyword').notNull(),
  competitorPosition: integer('competitor_position').notNull(),
  ourPosition: integer('our_position'),
  competitorUrl: text('competitor_url'),
  gapOpportunity: integer('gap_opportunity'), // 0-100 score
  analysisDate: text('analysis_date').default(new Date().toISOString()),
});

// SEO automation tasks
export const seoAutomationTasks = sqliteTable('seo_automation_tasks', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  taskType: text('task_type').notNull(), // meta_optimization, internal_linking, content_gap, schema_enhancement
  priority: text('priority').default('medium'), // low, medium, high, critical
  title: text('title').notNull(),
  description: text('description'),
  impact: integer('impact'), // 0-100 estimated SEO impact
  effort: integer('effort'), // 0-100 estimated effort required
  status: text('status').default('pending'), // pending, in_progress, completed, dismissed
  automated: integer('automated', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// SEO performance analytics
export const seoPerformance = sqliteTable('seo_performance', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  organicClicks: integer('organic_clicks').default(0),
  organicImpressions: integer('organic_impressions').default(0),
  organicCtr: real('organic_ctr'), // click-through rate
  avgPosition: real('avg_position'),
  backlinks: integer('backlinks').default(0),
  referringDomains: integer('referring_domains').default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// ===== WHITE-LABEL AGENCY SOLUTIONS =====

// Agency clients
export const agencyClients = sqliteTable('agency_clients', {
  id: text('id').primaryKey(),
  agencyId: text('agency_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  clientPhone: text('client_phone'),
  clientCompany: text('client_company'),
  status: text('status').default('active'), // active, inactive, suspended
  monthlyFee: integer('monthly_fee'), // in cents
  notes: text('notes'),
  metadata: text('metadata'), // JSON string for additional client data
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Client team assignments
export const clientTeamAssignments = sqliteTable('client_team_assignments', {
  id: text('id').primaryKey(),
  clientId: text('client_id').references(() => agencyClients.id, { onDelete: 'cascade' }).notNull(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('client'), // client, consultant, manager
  permissions: text('permissions'), // JSON string for specific permissions
  assignedAt: text('assigned_at').default(new Date().toISOString()),
});

// White-label branding settings
export const whiteLabelSettings = sqliteTable('white_label_settings', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).unique(),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: text('primary_color'),
  secondaryColor: text('secondary_color'),
  accentColor: text('accent_color'),
  customCss: text('custom_css'),
  customDomain: text('custom_domain'),
  removePolarBranding: integer('remove_polar_branding', { mode: 'boolean' }).default(false),
  customFooterHtml: text('custom_footer_html'),
  customHeaderHtml: text('custom_header_html'),
  emailSettings: text('email_settings'), // JSON string for email customization
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Agency billing and profit sharing
export const agencyBilling = sqliteTable('agency_billing', {
  id: text('id').primaryKey(),
  agencyId: text('agency_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  clientId: text('client_id').references(() => agencyClients.id, { onDelete: 'cascade' }).notNull(),
  billingPeriod: text('billing_period').notNull(), // YYYY-MM format
  totalRevenue: integer('total_revenue').notNull(), // in cents
  polarFees: integer('polar_fees').notNull(), // in cents
  agencyProfit: integer('agency_profit').notNull(), // in cents
  profitMarginPercent: integer('profit_margin_percent'),
  status: text('status').default('pending'), // pending, paid, overdue
  paidAt: text('paid_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Bulk operations for agencies
export const agencyBulkOperations = sqliteTable('agency_bulk_operations', {
  id: text('id').primaryKey(),
  agencyId: text('agency_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  operationType: text('operation_type').notNull(), // client_onboarding, content_creation, seo_audit
  status: text('status').default('pending'), // pending, in_progress, completed, failed
  progress: integer('progress').default(0), // 0-100 percentage
  totalItems: integer('total_items'),
  completedItems: integer('completed_items').default(0),
  settings: text('settings'), // JSON string for operation parameters
  results: text('results'), // JSON string for operation results
  errorMessage: text('error_message'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// ===== SOCIAL MEDIA AUTOMATION =====

// Social media connections (OAuth tokens)
export const socialConnections = sqliteTable('social_connections', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  platform: text('platform').notNull(), // twitter, linkedin, facebook, instagram
  accountId: text('account_id').notNull(), // Platform-specific account ID
  accountName: text('account_name'), // Display name
  accessToken: text('access_token'), // Encrypted
  refreshToken: text('refresh_token'), // Encrypted
  tokenExpiresAt: text('token_expires_at'),
  profileImage: text('profile_image'),
  followers: integer('default 0'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Scheduled social posts
export const socialPosts = sqliteTable('social_posts', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // twitter, linkedin, facebook, instagram
  content: text('content').notNull(),
  mediaUrls: text('media_urls'), // JSON array of image/video URLs
  status: text('status').default('pending'), // pending, scheduled, published, failed
  scheduledAt: text('scheduled_at'),
  publishedAt: text('published_at'),
  platformPostId: text('platform_post_id'), // ID on the social platform
  platformPostUrl: text('platform_post_url'),
  engagement: text('engagement'), // JSON: likes, comments, shares, clicks
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// ===== EMAIL NEWSLETTER =====

// Newsletter subscribers
export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: text('id').primaryKey(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  name: text('name'),
  status: text('status').default('active'), // active, unsubscribed, bounced
  source: text('source'), // signup_form, imported, api
  tags: text('tags'), // JSON array
  subscribedAt: text('subscribed_at').default(new Date().toISOString()),
  unsubscribedAt: text('unsubscribed_at'),
  lastEmailSentAt: text('last_email_sent_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// Email campaigns
export const emailCampaigns = sqliteTable('email_campaigns', {
  id: text('id').primaryKey(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(), // HTML content
  status: text('status').default('draft'), // draft, scheduled, sent, failed
  recipientCount: integer('recipient_count').default(0),
  sentCount: integer('sent_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  unsubscribedCount: integer('unsubscribed_count').default(0),
  scheduledAt: text('scheduled_at'),
  sentAt: text('sent_at'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// ===== CUSTOMER WEBHOOKS =====

// Webhook configurations
export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(), // Webhook URL
  events: text('events').notNull(), // JSON array: post.published, post.created, lead.created, etc.
  secret: text('secret'), // Webhook signing secret
  active: integer('active', { mode: 'boolean' }).default(true),
  lastTriggeredAt: text('last_triggered_at'),
  failureCount: integer('failure_count').default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Webhook delivery logs
export const webhookLogs = sqliteTable('webhook_logs', {
  id: text('id').primaryKey(),
  webhookId: text('webhook_id').references(() => webhooks.id, { onDelete: 'cascade' }).notNull(),
  event: text('event').notNull(),
  payload: text('payload'), // JSON string
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  duration: integer('duration'), // ms
  success: integer('success', { mode: 'boolean' }).default(false),
  errorMessage: text('error_message'),
  triggeredAt: text('triggered_at').default(new Date().toISOString()),
});

// ===== ANALYTICS =====

// Enhanced analytics events
export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // pageview, click, scroll, share, signup
  sessionId: text('session_id'),
  userId: text('user_id'),
  url: text('url'),
  referrer: text('referrer'),
  device: text('device'), // desktop, mobile, tablet
  browser: text('browser'),
  os: text('os'),
  country: text('country'),
  metadata: text('metadata'), // JSON for additional data
  timestamp: text('timestamp').default(new Date().toISOString()),
});

// ===== DEVELOPER API KEYS =====

// API keys for developers
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  key: text('key').unique().notNull(),
  prefix: text('prefix').notNull(), // First 8 chars for display
  permissions: text('permissions').notNull(), // JSON: read, write, etc.
  rateLimit: integer('rate_limit').default(100), // requests per minute
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(new Date().toISOString()),
});

// ===== MEDIA LIBRARY =====

// Media files with optimization
export const mediaFiles = sqliteTable('media_files', {
  id: text('id').primaryKey(),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  blogId: text('blog_id').references(() => blogs.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalUrl: text('original_url').notNull(),
  optimizedUrl: text('optimized_url'),
  thumbnailUrl: text('thumbnail_url'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // bytes
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text'),
  caption: text('caption'),
  optimized: integer('optimized', { mode: 'boolean' }).default(false),
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

// Polar payment schemas
export const insertPolarCustomerSchema = createInsertSchema(polarCustomers);
export const selectPolarCustomerSchema = createSelectSchema(polarCustomers);
export const insertPolarSubscriptionSchema = createInsertSchema(polarSubscriptions);
export const selectPolarSubscriptionSchema = createSelectSchema(polarSubscriptions);
export const insertPolarOrderSchema = createInsertSchema(polarOrders);
export const selectPolarOrderSchema = createSelectSchema(polarOrders);
export const insertUsageTrackingSchema = createInsertSchema(usageTracking);
export const selectUsageTrackingSchema = createSelectSchema(usageTracking);

// SEO automation schemas
export const insertKeywordRankingSchema = createInsertSchema(keywordRankings);
export const selectKeywordRankingSchema = createSelectSchema(keywordRankings);
export const insertCompetitorAnalysisSchema = createInsertSchema(competitorAnalysis);
export const selectCompetitorAnalysisSchema = createSelectSchema(competitorAnalysis);
export const insertSeoAutomationTaskSchema = createInsertSchema(seoAutomationTasks);
export const selectSeoAutomationTaskSchema = createSelectSchema(seoAutomationTasks);
export const insertSeoPerformanceSchema = createInsertSchema(seoPerformance);
export const selectSeoPerformanceSchema = createSelectSchema(seoPerformance);

// White-label agency schemas
export const insertAgencyClientSchema = createInsertSchema(agencyClients);
export const selectAgencyClientSchema = createSelectSchema(agencyClients);
export const insertClientTeamAssignmentSchema = createInsertSchema(clientTeamAssignments);
export const selectClientTeamAssignmentSchema = createSelectSchema(clientTeamAssignments);
export const insertWhiteLabelSettingSchema = createInsertSchema(whiteLabelSettings);
export const selectWhiteLabelSettingSchema = createSelectSchema(whiteLabelSettings);
export const insertAgencyBillingSchema = createInsertSchema(agencyBilling);
export const selectAgencyBillingSchema = createSelectSchema(agencyBilling);
export const insertAgencyBulkOperationSchema = createInsertSchema(agencyBulkOperations);
export const selectAgencyBulkOperationSchema = createSelectSchema(agencyBulkOperations);

// Types
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// Polar payment types
export type PolarCustomer = typeof polarCustomers.$inferSelect;
export type NewPolarCustomer = typeof polarCustomers.$inferInsert;
export type PolarSubscription = typeof polarSubscriptions.$inferSelect;
export type NewPolarSubscription = typeof polarSubscriptions.$inferInsert;
export type PolarOrder = typeof polarOrders.$inferSelect;
export type NewPolarOrder = typeof polarOrders.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;

// SEO automation types
export type KeywordRanking = typeof keywordRankings.$inferSelect;
export type NewKeywordRanking = typeof keywordRankings.$inferInsert;
export type CompetitorAnalysis = typeof competitorAnalysis.$inferSelect;
export type NewCompetitorAnalysis = typeof competitorAnalysis.$inferInsert;
export type SeoAutomationTask = typeof seoAutomationTasks.$inferSelect;
export type NewSeoAutomationTask = typeof seoAutomationTasks.$inferInsert;
export type SeoPerformance = typeof seoPerformance.$inferSelect;
export type NewSeoPerformance = typeof seoPerformance.$inferInsert;

// White-label agency types
export type AgencyClient = typeof agencyClients.$inferSelect;
export type NewAgencyClient = typeof agencyClients.$inferInsert;
export type ClientTeamAssignment = typeof clientTeamAssignments.$inferSelect;
export type NewClientTeamAssignment = typeof clientTeamAssignments.$inferInsert;
export type WhiteLabelSetting = typeof whiteLabelSettings.$inferSelect;
export type NewWhiteLabelSetting = typeof whiteLabelSettings.$inferInsert;
export type AgencyBilling = typeof agencyBilling.$inferSelect;
export type NewAgencyBilling = typeof agencyBilling.$inferInsert;
export type AgencyBulkOperation = typeof agencyBulkOperations.$inferSelect;
export type NewAgencyBulkOperation = typeof agencyBulkOperations.$inferInsert;