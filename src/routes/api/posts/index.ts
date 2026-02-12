import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../../lib/db'
import { posts } from '../../../lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/posts')({
  POST: async ({ request, env }) => {
    try {
      const body = await request.json()
      const {
        blogId,
        title,
        slug,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        focusKeyword,
        authorId,
      } = body

      // Validate required fields
      if (!blogId || !title || !slug || !content) {
        return json(
          { error: 'Blog ID, title, slug, and content are required' },
          { status: 400 }
        )
      }

      const db = createDb(env as any)

      // Check if slug already exists in this blog
      const existingPost = await db
        .select()
        .from(posts)
        .where(and(
          eq(posts.blogId, blogId),
          eq(posts.slug, slug)
        ))
        .limit(1)

      if (existingPost.length > 0) {
        return json(
          { error: 'A post with this slug already exists in this blog' },
          { status: 409 }
        )
      }

      // Calculate reading time
      const wordCount = content.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // Assuming 200 WPM

      // Create post
      const postId = nanoid()
      const now = new Date().toISOString()

      await db.insert(posts).values({
        id: postId,
        blogId,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        focusKeyword: focusKeyword || null,
        status: 'draft',
        readingTime,
        authorId: authorId || null,
        createdAt: now,
        updatedAt: now,
      })

      return json({
        success: true,
        post: {
          id: postId,
          blogId,
          title,
          slug,
          status: 'draft',
          readingTime,
          createdAt: now,
        },
      })
    } catch (error: any) {
      console.error('Error creating post:', error)
      return json(
        { error: 'Failed to create post. Please try again.' },
        { status: 500 }
      )
    }
  },

  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url)
      const blogId = url.searchParams.get('blogId')
      const status = url.searchParams.get('status')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      if (!blogId) {
        return json(
          { error: 'Blog ID is required' },
          { status: 400 }
        )
      }

      const db = createDb(env as any)

      let query = db
        .select()
        .from(posts)
        .where(eq(posts.blogId, blogId))
        .orderBy(posts.createdAt)
        .limit(limit)
        .offset(offset)

      if (status) {
        query = db
          .select()
          .from(posts)
          .where(and(
            eq(posts.blogId, blogId),
            eq(posts.status, status)
          ))
          .orderBy(posts.createdAt)
          .limit(limit)
          .offset(offset)
      }

      const postsList = await query

      return json({
        success: true,
        posts: postsList,
      })
    } catch (error: any) {
      console.error('Error fetching posts:', error)
      return json(
        { error: 'Failed to fetch posts. Please try again.' },
        { status: 500 }
      )
    }
  },
})
