import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../../lib/db'
import { getTeamBySubdomain, getTeamByCustomDomain, getBlogWithPosts } from '../../../lib/db'
import { blogs } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/rss.xml')({
  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url)
      const hostname = url.hostname

      const db = createDb(env as any)

      // Try to find team by custom domain or subdomain
      let team = await getTeamByCustomDomain(db, hostname)
      
      if (!team) {
        const subdomain = hostname.split('.')[0]
        if (subdomain && subdomain !== 'www' && subdomain !== 'blogsaas') {
          team = await getTeamBySubdomain(db, subdomain)
        }
      }

      if (!team) {
        return new Response('Team not found', { status: 404 })
      }

      // Get all blogs for this team
      const teamBlogs = await db
        .select()
        .from(blogs)
        .where(eq(blogs.teamId, team.id))

      const baseUrl = team.customDomain 
        ? `https://${team.customDomain}`
        : `https://${team.subdomain}.blogsaas.com`

      // Get posts from all blogs
      let allPosts: any[] = []
      for (const blog of teamBlogs) {
        const blogData = await getBlogWithPosts(db, blog.id, 20, 0)
        allPosts = [...allPosts, ...blogData.posts.map(p => ({ ...p, blog }))]
      }

      // Sort by published date
      allPosts.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0)
        const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      // Build RSS feed
      const rssItems = allPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/${post.blog.id}/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${post.blog.id}/${post.slug}</guid>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      ${post.authorName ? `<author>${post.authorName}</author>` : ''}
    </item>`).join('')

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${team.name} Blog]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[Latest posts from ${team.name}]]></description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

      return new Response(rss, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (error) {
      console.error('Error generating RSS:', error)
      return new Response('Error generating RSS feed', { status: 500 })
    }
  },
})
