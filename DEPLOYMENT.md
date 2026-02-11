# 🚀 Quick Start & Deployment Guide

## Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account
- Git

## Local Development

```bash
# Clone the repository
git clone https://github.com/hirajanwin/blog-saas.git
cd blog-saas

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

## Database Setup

```bash
# Create D1 database
npx wrangler d1 create blog-saas-db

# Note the database ID from the output

# Update wrangler.jsonc with your database ID
```

## Deployment to Cloudflare

### 1. Configure Wrangler

Edit `wrangler.jsonc`:
```json
{
  "name": "blog-saas",
  "compatibility_date": "2026-02-11",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "blog-saas-db",
      "database_id": "YOUR-DATABASE-ID-HERE"
    }
  ],
  "vars": {
    "ENVIRONMENT": "production",
    "OPENAI_API_KEY": "your-openai-key-here"
  }
}
```

### 2. Set Environment Variables

```bash
# Set your Cloudflare API token
export CLOUDFLARE_API_TOKEN=your_token_here

# Or login via Wrangler
npx wrangler login
```

### 3. Deploy

```bash
# Build and deploy
npm run deploy
```

Your app will be deployed to `https://blog-saas.your-subdomain.workers.dev`

## Post-Deployment Checklist

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Database migrations applied
- [ ] AI API keys configured
- [ ] IndexNow key generated
- [ ] First team/blog created
- [ ] Admin user set up

## Features Tested & Working

✅ Multi-tenant architecture
✅ Post creation & editing
✅ Real-time SEO scoring
✅ AI content generation
✅ Team collaboration (comments & tasks)
✅ Privacy-friendly analytics
✅ Lead generation forms
✅ IndexNow integration
✅ Image upload & optimization
✅ XML sitemaps
✅ Robots.txt management

## Next Steps

1. Configure custom domain in Cloudflare
2. Set up email service for notifications
3. Configure OpenAI API for AI features
4. Create your first team and blog
5. Start creating content!

## Support

- Documentation: IMPLEMENTATION.md
- Repository: https://github.com/hirajanwin/blog-saas
- Issues: https://github.com/hirajanwin/blog-saas/issues

---

**Built with ❤️ using TanStack Start, Cloudflare, and modern web technologies.**