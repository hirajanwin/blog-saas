import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../../lib/db'
import { postComments, posts, users } from '../../../lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/posts/$postId/comments')({
  GET: async ({ params, env }) => {
    try {
      const { postId } = params;

      if (!postId) {
        return json({ error: 'Post ID is required' }, { status: 400 });
      }

      const db = createDb(env as any);

      const comments = await db
        .select({
          id: postComments.id,
          comment: postComments.comment,
          createdAt: postComments.createdAt,
          userId: postComments.userId,
          userName: users.name,
          userAvatar: users.avatarUrl,
          resolved: postComments.resolved,
        })
        .from(postComments)
        .leftJoin(users, eq(postComments.userId, users.id))
        .where(eq(postComments.postId, postId))
        .orderBy(desc(postComments.createdAt));

      return json({
        success: true,
        comments,
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }
  },

  POST: async ({ params, request, env }) => {
    try {
      const { postId } = params;
      const { comment, userId } = await request.json();

      if (!postId || !comment?.trim()) {
        return json(
          { error: 'Post ID and comment are required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Check if post exists
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (post.length === 0) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      // Create comment
      const commentId = nanoid();
      const now = new Date().toISOString();

      await db.insert(postComments).values({
        id: commentId,
        postId,
        userId: userId || null,
        comment: comment.trim(),
        createdAt: now,
        resolved: false,
      });

      // Get user info if available
      let userInfo = null;
      if (userId) {
        const user = await db
          .select({ name: users.name, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        userInfo = user[0] || null;
      }

      return json({
        success: true,
        comment: {
          id: commentId,
          comment: comment.trim(),
          createdAt: now,
          userId,
          userName: userInfo?.name || 'Anonymous',
          userAvatar: userInfo?.avatarUrl || null,
          resolved: false,
        },
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      return json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }
  },
});
