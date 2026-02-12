# Blog SaaS Platform

A modern, SEO-optimized blogging platform built with TanStack Start and Cloudflare Workers. This platform combines the best features from Superblog.ai and Outrank.so with a focus on automated SEO, performance, and AI-powered content creation.

## 🚀 Features Implemented

### ✅ Core Platform
- **TanStack Start + Cloudflare Workers**: Modern full-stack framework with edge deployment
- **Multi-tenant Architecture**: Support for multiple teams and blogs with subdomain routing
- **D1 Database**: Comprehensive schema for teams, users, blogs, posts, and SEO data
- **Type-safe Development**: Full TypeScript support with Drizzle ORM

### ✅ Content Management
- **Tiptap Editor**: Rich text editor with markdown shortcuts and formatting
  - `Cmd/Ctrl + B`: Bold
  - `Cmd/Ctrl + I`: Italic
  - `Cmd/Ctrl + 1/2/3`: Headers
  - `Cmd/Ctrl + K`: Links
  - `Cmd/Ctrl + Shift + 8/9`: Lists
- **Post CRUD Operations**: Create, edit, draft, and publish posts
- **SEO Metadata**: Title, description, Open Graph tags
- **Draft/Publish Workflow**: Save drafts and publish when ready

### ✅ SEO Optimization
- **Auto Meta Tags**: Generated from content for optimal search visibility
- **Open Graph Support**: Social media sharing optimization
- **JSON-LD Schemas**: Article schema for rich search results
- **SEO Scoring**: Real-time SEO validation and suggestions
- **URL Structure**: Clean, SEO-friendly URLs with slugs

### ✅ Multi-tenant Routing
- **Team Management**: `/team-subdomain/` shows all blogs for a team
- **Blog Display**: `/team/blog-id/` displays blog posts
- **Individual Posts**: `/team/blog-id/post-slug/` for article pages
- **Admin Interface**: `/team/blog-id/admin/` for blog management
- **Post Editor**: `/team/blog-id/admin/posts/new` for creating posts

### ✅ UI Components
- **shadcn/ui Components**: Modern, accessible component library
  - Button variants (default, destructive, outline, secondary, ghost, link)
  - Input fields with validation
  - Textarea with error handling
  - Responsive design system
- **Medium-Inspired Design**: Clean, typography-focused blog layout
- **Tailwind CSS v4**: Utility-first styling with modern features

### ✅ Performance Features
- **Static Site Generation**: Optimized build process with TanStack Start
- **Cloudflare CDN**: Global edge delivery for fast page loads
- **90+ Lighthouse Scores**: Optimized for performance, SEO, and accessibility
- **Bundle Optimization**: Code splitting and minification

## 🔥 Additional Features

- **A/B Testing**: Allows users to test different headlines and see which one performs better.
- **Content Performance Analytics**: A dashboard for tracking key content metrics like views, visitors, bounce rate, and conversions.
- **Email Newsletter Integration**: A system for managing subscribers and sending newsletters.
- **Broken Link Checker**: A tool for scanning posts for broken, redirected, or slow external links.
- **Content Repurposer**: A tool to transform an article into different formats like a Twitter thread, LinkedIn post, or newsletter.
- **Dark Mode Toggle**: A toggle to switch between light and dark mode.
- **Reading Progress**: A progress bar that shows how far the user has scrolled through an article.
- **Table of Contents**: A component that automatically generates a table of contents for an article based on its headings.
- **Content Calendar**: A calendar for scheduling and viewing content (posts, social media, emails).
- **Revision History**: A system for viewing and restoring previous versions of a post.
- **Migration Tools**: Tools for importing content from other platforms like WordPress, Medium, and Ghost.
- **Lead Generation**: A feature for creating and managing lead generation forms.
- **Analytics Dashboard**: A dashboard for viewing privacy-friendly analytics.
- **Content Tasks**: A tool for creating and managing tasks related to content creation.
- **Post Comments**: A commenting system for posts.

## 💰 Monetization & Payments

- **Polar Integration**: Complete payment system for subscriptions and one-time payments
  - Checkout flow with product selection
  - Webhook handlers for subscription events
  - Customer management
  - Usage-based billing tracking
- **Pricing Plans**:
  - **Starter** (Free): 1 blog, 10 posts/month, 1,000 AI credits
  - **Professional** ($49/mo): 5 blogs, unlimited posts, 10K AI credits, custom domains
  - **Agency** ($199/mo): Unlimited everything, white-label, client management, revenue sharing
- **Usage Tracking**: AI credits, API calls, storage monitoring

## 📈 SEO Automation Suite

- **Keyword Rank Tracking**: Track rankings across Google, Bing, DuckDuckGo
  - Position monitoring by location and device
  - Historical tracking with change notifications
- **Competitor Analysis**: 
  - Identify content gaps vs competitors
  - Gap opportunity scoring (0-100)
  - Automated competitor monitoring
- **SEO Tasks**:
  - Automated recommendation generation
  - Priority, impact, and effort scoring
  - Task status tracking (pending, in_progress, completed)
  - Automated vs manual task distinction
- **Performance Analytics**:
  - Organic clicks, impressions, CTR tracking
  - Average position monitoring
  - Backlink and referring domain tracking

## 🏢 White-Label Agency Solutions

- **Client Management**:
  - Full client profiles with company info
  - Team assignment per client
  - Permission controls
  - Monthly fee tracking
- **White-Label Branding**:
  - Custom logo and favicon
  - Primary/secondary/accent color customization
  - Custom CSS injection
  - Custom domain support
  - Header/footer HTML injection
  - Remove platform branding option
- **Agency Billing**:
  - Automatic billing generation
  - Polar fee calculation
  - Profit margin tracking
  - Revenue analytics
- **Bulk Operations**:
  - Batch client onboarding
  - Content creation automation
  - SEO audit automation
  - Progress tracking

## 🎯 Revenue Model

### For Platform (You)
- **Subscription Revenue**: Monthly/yearly plans via Polar
- **Transaction Fees**: 5% on agency billing (built-in)
- **Enterprise Deals**: Custom pricing for large teams

### For Agencies (Your Customers)
- **Client Billing**: Agencies set their own prices
- **Profit Margins**: Track difference between wholesale and retail
- **Recurring Revenue**: Monthly retainer model support

## 🏗️ Architecture

### Database Schema
- **Teams**: Multi-tenant organization with subdomains and custom domains
- **Users**: Team members with roles (admin, editor, author, viewer)
- **Blogs**: Individual blog sites with SEO settings and themes
- **Posts**: Content with SEO metadata, status tracking, and analytics
- **SEO Metadata**: Meta tags, Open Graph, schema data
- **Analytics**: Privacy-friendly page views and engagement tracking
- **AI Features**: Content suggestions, optimization, and generation (ready)

### Tech Stack
- **Framework**: TanStack Start (React + SSR + Router)
- **Deployment**: Cloudflare Workers (Edge computing)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM with TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Editor**: Tiptap with extensions
- **AI**: TanStack AI with OpenAI/Anthropic providers

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Cloudflare account (for deployment)

### Installation

1. **Clone and Install**:
```bash
git clone <your-repo>
cd blog-saas
npm install
```

2. **Database Setup**:
```bash
# Create D1 database
npx wrangler d1 create blog-saas-db

# Run migrations (once database is created)
npm run db:migrate
```

3. **Development**:
```bash
npm run dev
```

4. **Building**:
```bash
npm run build
```

5. **Deployment**:
```bash
npm run deploy
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── editor/             # Tiptap editor extensions
│   └── blog/              # Blog display components
├── lib/
│   ├── db/                # Database schema and queries
│   └── utils/              # Utility functions
├── routes/
│   ├── [team]/             # Multi-tenant routes
│   │   ├── [blog]/        # Blog-specific routes
│   │   │   ├── admin/    # Admin interface
│   │   │   └── [slug]/  # Individual posts
│   │   └── index.tsx    # Blog listing
│   └── index.tsx           # Team dashboard
│   └── __root.tsx          # Root layout
├── styles/                  # Global CSS and Tailwind
└── types/                   # TypeScript definitions
```

## 🎯 Next Steps (Phase 2-4)

### Phase 2: Advanced SEO & Performance
- [x] XML sitemap generation
- [x] Robots.txt management
- [x] Internal linking suggestions
- [x] Core Web Vitals optimization
- [x] Image WebP conversion pipeline

### Phase 3: AI Content Generation
- [x] AI article generation
- [x] Keyword research automation
- [x] Content optimization suggestions
- [x] Real-time SEO scoring
- [x] Team collaboration features

### Phase 4: Monetization & Agency Tools
- [x] Polar payment integration
- [x] Subscription management (webhooks)
- [x] Usage-based billing
- [x] Pricing plans (Starter, Professional, Agency)
- [x] Agency client management
- [x] White-label branding
- [x] Bulk operations
- [x] SEO automation suite
- [x] Competitor analysis
- [x] Keyword rank tracking

### Phase 5: Enterprise Features (Coming Soon)
- [ ] Advanced analytics & reporting
- [ ] Custom integrations
- [ ] SLA guarantees
- [ ] Dedicated support tiers

## 🔧 Configuration

### Environment Variables
```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Database
DATABASE_ID=your_d1_database_id

# AI Providers (Phase 3)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Polar Payments (Phase 4)
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
PUBLIC_URL=https://your-domain.com
```

### Wrangler Configuration
```toml
[wrangler]
name = "blog-saas"
compatibility_date = "2026-02-11"
compatibility_flags = ["nodejs_compat"]
main = "@tanstack/react-start/server-entry"

[[d1_databases]]
binding = "DB"
database_name = "blog-saas-db"
database_id = "your-database-id"
```

## 🎨 Design System

### Typography
- **Primary Font**: Inter (system font stack)
- **Heading Weights**: 700 (bold), 600 (semibold)
- **Body Text**: 400 (regular)
- **Line Height**: 1.75 for optimal readability

### Colors
- **Primary**: Blue 600 (#2563eb)
- **Secondary**: Gray 600 (#4b5563)
- **Success**: Green 600 (#059669)
- **Error**: Red 600 (#dc2626)

### Spacing
- **Container**: Max width 6xl (1152px)
- **Content**: Max width 4xl (896px)
- **Responsive**: Mobile-first design

## 📊 Success Metrics

### Performance Targets
- [x] Sub-second page loads
- [x] 90+ Lighthouse scores
- [x] 670KB initial bundle
- [x] Edge caching with Cloudflare

### SEO Targets
- [x] Auto-generated meta tags
- [x] JSON-LD Article schema
- [x] SEO scoring system
- [x] Clean URL structure

### Content Experience
- [x] Modern rich text editor
- [x] Multi-tenant support
- [x] Responsive design
- [x] Type-safe development

## 🤝 Contributing

This project follows master-level engineering practices:
- Type-safe development with TypeScript
- Component-driven architecture
- Performance optimization
- SEO best practices
- Modern React patterns

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using TanStack Start, Cloudflare Workers, and modern web technologies.**