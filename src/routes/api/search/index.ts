import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../lib/db'
import { posts, blogs, teams } from '../../lib/db/schema'
import { eq, and, like, or } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/search')({
  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url)
      const query = url.searchParams.get('q')
      const teamId = url.searchParams.get('teamId')
      const blogId = url.searchParams.get('blogId')

      if (!query || query.trim().length < 2) {
        return json(
          { error: 'Search query must be at least 2 characters' },
          { status: 400 }
        )
      }

      const db = createDb(env as any)
      const searchTerm = `%${query.trim()}%`

      // Build the query conditions
      let conditions = and(
        eq(posts.status, 'published'),
        or(
          like(posts.title, searchTerm),
          like(posts.content, searchTerm),
          like(posts.excerpt, searchTerm),
          like(posts.focusKeyword, searchTerm)
        )
      )

      if (blogId) {
        conditions = and(conditions, eq(posts.blogId, blogId))
      }

      // Search posts
      const searchResults = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          publishedAt: posts.publishedAt,
          blogId: posts.blogId,
          views: posts.views,
          readingTime: posts.readingTime,
        })
        .from(posts)
        .where(conditions)
        .limit(20)

      // Get blog info for each result
      const resultsWithBlogInfo = await Promise.all(
        searchResults.map(async (post) => {
          const blog = await db
            .select({
              id: blogs.id,
              title: blogs.title,
              teamId: blogs.teamId,
            })
            .from(blogs)
            .where(eq(blogs.id, post.blogId))
            .limit(1)

          let teamSubdomain = ''
          if (blog[0]?.teamId) {
            const team = await db
              .select({ subdomain: teams.subdomain })
              .from(teams)
              .where(eq(teams.id, blog[0].teamId))
              .limit(1)
            teamSubdomain = team[0]?.subdomain || ''
          }

          return {
            ...post,
            blog: blog[0] || null,
            teamSubdomain,
          }
        })
      )

      return json({
        success: true,
        query: query.trim(),
        results: resultsWithBlogInfo,
        total: resultsWithBlogInfo.length,
      })
    } catch (error) {
      console.error('Error searching:', error)
      return json(
        { error: 'Failed to perform search' },
        { status: 500 }
      )
    }
  },
})
