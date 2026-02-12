import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../lib/db'
import { users } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/users/preferences')({
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

      // Get existing preferences
      let currentPreferences = {};
      try {
        currentPreferences = JSON.parse(existingUser[0].preferences || '{}');
      } catch (e) {
        // Invalid JSON, start fresh
      }

      // Merge with new preferences
      const newPreferences = {
        ...currentPreferences,
        ...body,
      };

      // Update user preferences
      await db
        .update(users)
        .set({
          preferences: JSON.stringify(newPreferences),
        })
        .where(eq(users.id, userId));

      return json({
        success: true,
        preferences: newPreferences,
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      return json(
        { error: 'Failed to update preferences. Please try again.' },
        { status: 500 }
      );
    }
  },

  GET: async ({ request, env }) => {
    try {
      // Get user from auth token
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const userId = decoded.split(':')[0];

      const db = createDb(env as any);

      const user = await db
        .select({
          preferences: users.preferences,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return json({ error: 'User not found' }, { status: 404 });
      }

      let preferences = {};
      try {
        preferences = JSON.parse(user[0].preferences || '{}');
      } catch (e) {
        // Invalid JSON
      }

      return json({
        success: true,
        preferences,
      });
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      return json(
        { error: 'Failed to fetch preferences. Please try again.' },
        { status: 500 }
      );
    }
  },
})
