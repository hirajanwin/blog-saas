import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../lib/db'
import { users } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/users/me')({
  GET: async ({ request, env }) => {
    try {
      // Get user from auth token (in production, verify JWT)
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      // Decode token to get user ID (simple base64 decode for demo)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const userId = decoded.split(':')[0];

      const db = createDb(env as any);

      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          avatarUrl: users.avatarUrl,
          role: users.role,
          teamId: users.teamId,
          preferences: users.preferences,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return json({ error: 'User not found' }, { status: 404 });
      }

      return json({
        success: true,
        user: user[0],
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return json(
        { error: 'Failed to fetch user. Please try again.' },
        { status: 500 }
      );
    }
  },

  PUT: async ({ request, env }) => {
    try {
      // Get user from auth token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const userId = decoded.split(':')[0];

      const body = await request.json();
      const { name, avatarUrl } = body;

      const db = createDb(env as any);

      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (existingUser.length === 0) {
        return json({ error: 'User not found' }, { status: 404 });
      }

      // Update user
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId));
      }

      return json({
        success: true,
        user: {
          id: userId,
          name: name || existingUser[0].name,
          avatarUrl: avatarUrl || existingUser[0].avatarUrl,
        },
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      return json(
        { error: 'Failed to update user. Please try again.' },
        { status: 500 }
      );
    }
  },
})
