import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../lib/db'
import { users } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

// Simple token generation (in production, use JWT)
function generateToken(userId: string): string {
  const timestamp = Date.now();
  return Buffer.from(`${userId}:${timestamp}`).toString('base64');
}

export const APIRoute = createAPIFileRoute('/api/auth/register')({
  POST: async ({ request, env }) => {
    try {
      const { name, email, password } = await request.json();

      // Validate required fields
      if (!name || !email || !password) {
        return json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      // Create user
      const userId = nanoid();
      const now = new Date().toISOString();

      await db.insert(users).values({
        id: userId,
        email,
        name,
        role: 'admin', // First user is admin
        preferences: JSON.stringify({
          notifications: {
            email: true,
            browser: true,
          },
          editor: {
            autoSave: true,
            spellCheck: true,
          },
        }),
        createdAt: now,
      });

      const token = generateToken(userId);

      return json({
        success: true,
        token,
        user: {
          id: userId,
          email,
          name,
          role: 'admin',
          teamId: null,
        },
      });
    } catch (error: any) {
      console.error('Error registering user:', error);
      return json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }
  },
})
