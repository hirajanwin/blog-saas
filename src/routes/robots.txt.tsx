import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../lib/db'
import { getTeamBySubdomain, getTeamByCustomDomain } from '../lib/db'

export const APIRoute = createAPIFileRoute('/robots.txt')({
  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url)
      const hostname = url.hostname

      const db = createDb(env as any)

      // Try to find team by custom domain or subdomain
      let team = await getTeamByCustomDomain(db, hostname)
      
      if (!team) {
        // Extract subdomain from hostname (e.g., team.blogsaas.com)
        const subdomain = hostname.split('.')[0]
        if (subdomain && subdomain !== 'www' && subdomain !== 'blogsaas') {
          team = await getTeamBySubdomain(db, subdomain)
        }
      }

      const baseUrl = team 
        ? (team.customDomain 
            ? `https://${team.customDomain}`
            : `https://${team.subdomain}.blogsaas.com`)
        : `https://${hostname}`

      // Generate robots.txt content
      const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /create-team
Disallow: /*.json$

# AI crawlers
User-agent: ChatGPT
Allow: /
Disallow: /admin/

User-agent: GPTBot
Allow: /
Disallow: /admin/

User-agent: anthropic-ai
Allow: /
Disallow: /admin/

User-agent: Claude-Web
Allow: /
Disallow: /admin/

# Search engines
User-agent: Googlebot
Allow: /
Disallow: /admin/

User-agent: Bingbot
Allow: /
Disallow: /admin/

User-agent: Slurp
Allow: /
Disallow: /admin/

User-agent: DuckDuckBot
Allow: /
Disallow: /admin/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml`

      return new Response(robots, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    } catch (error) {
      console.error('Error generating robots.txt:', error)
      
      // Return default robots.txt on error
      const defaultRobots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: /sitemap.xml`

      return new Response(defaultRobots, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  },
})
