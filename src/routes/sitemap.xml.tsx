import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../lib/db'
import { getTeamBySubdomain, getTeamByCustomDomain, getBlogWithPosts } from '../lib/db'
import { blogs } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/sitemap.xml')({
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

      if (!team) {
        // Return empty sitemap if no team found
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
        
        return new Response(emptySitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }

      // Get all blogs for this team
      const teamBlogs = await db
        .select()
        .from(blogs)
        .where(eq(blogs.teamId, team.id))

      const baseUrl = team.customDomain 
        ? `https://${team.customDomain}`
        : `https://${team.subdomain}.blogsaas.com`

      // Build sitemap URLs
      const urls: string[] = []

      // Add home page
      urls.push(`
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`)

      // Add blog pages and posts
      for (const blog of teamBlogs) {
        // Add blog home page
        urls.push(`
  <url>
    <loc>${baseUrl}/${blog.id}</loc>
    <lastmod>${new Date(blog.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)

        // Get published posts for this blog
        const blogData = await getBlogWithPosts(db, blog.id, 1000, 0)
        
        for (const post of blogData.posts) {
          urls.push(`
  <url>
    <loc>${baseUrl}/${blog.id}/${post.slug}</loc>
    <lastmod>${post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
        }
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`

      return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (error) {
      console.error('Error generating sitemap:', error)
      
      const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

      return new Response(errorSitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }
  },
})
