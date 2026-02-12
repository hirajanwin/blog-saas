import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../lib/db'
import { users, teams } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

// Simple token generation (in production, use JWT)
function generateToken(userId: string): string {
  const timestamp = Date.now();
  return Buffer.from(`${userId}:${timestamp}`).toString('base64');
}

export const APIRoute = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request, env }) => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Find user by email
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        return json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // In production, verify password hash
      // For now, we'll accept any password (demo purposes)
      // const validPassword = await verifyPassword(password, user[0].passwordHash);
      
      // Get team info if user has a team
      let teamSubdomain = null;
      if (user[0].teamId) {
        const team = await db
          .select()
          .from(teams)
          .where(eq(teams.id, user[0].teamId))
          .limit(1);
        if (team.length > 0) {
          teamSubdomain = team[0].subdomain;
        }
      }

      const token = generateToken(user[0].id);

      return json({
        success: true,
        token,
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          teamId: user[0].teamId,
          teamSubdomain,
        },
      });
    } catch (error: any) {
      console.error('Error logging in:', error);
      return json(
        { error: 'Failed to sign in. Please try again.' },
        { status: 500 }
      );
    }
  },
})
