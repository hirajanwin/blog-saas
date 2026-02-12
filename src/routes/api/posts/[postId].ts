import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../../lib/db'
import { posts } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/posts/$postId')({
  PUT: async ({ params, request, env }) => {
    try {
      const { postId } = params;
      
      if (!postId) {
        return json({ error: 'Post ID is required' }, { status: 400 });
      }

      const body = await request.json();
      const {
        title,
        slug,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        focusKeyword,
        status,
        publishedAt,
      } = body;

      // Validate required fields
      if (!title || !slug || !content) {
        return json(
          { error: 'Title, slug, and content are required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Check if post exists
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (existingPost.length === 0) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      // Check if slug is unique (excluding current post)
      if (slug !== existingPost[0].slug) {
        const slugExists = await db
          .select()
          .from(posts)
          .where(eq(posts.slug, slug))
          .where(eq(posts.blogId, existingPost[0].blogId))
          .limit(1);

        if (slugExists.length > 0 && slugExists[0].id !== postId) {
          return json(
            { error: 'A post with this slug already exists' },
            { status: 409 }
          );
        }
      }

      // Calculate reading time
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // Assuming 200 WPM

      // Update post
      const now = new Date().toISOString();
      await db
        .update(posts)
        .set({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          focusKeyword: focusKeyword || null,
          status,
          readingTime,
          publishedAt: publishedAt || existingPost[0].publishedAt,
          updatedAt: now,
        })
        .where(eq(posts.id, postId));

      return json({
        success: true,
        post: {
          id: postId,
          title,
          slug,
          status,
          updatedAt: now,
        },
      });
    } catch (error: any) {
      console.error('Error updating post:', error);
      return json(
        { error: 'Failed to update post. Please try again.' },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ params, env }) => {
    try {
      const { postId } = params;
      
      if (!postId) {
        return json({ error: 'Post ID is required' }, { status: 400 });
      }

      const db = createDb(env as any);

      // Check if post exists
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (existingPost.length === 0) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      // Delete post
      await db.delete(posts).where(eq(posts.id, postId));

      return json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return json(
        { error: 'Failed to delete post. Please try again.' },
        { status: 500 }
      );
    }
  },
})
