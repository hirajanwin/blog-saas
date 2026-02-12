import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../../lib/db'
import { teams, users } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/teams/$teamId/invite')({
  POST: async ({ params, request, env }) => {
    try {
      const { teamId } = params;
      const { email, role } = await request.json();

      if (!teamId || !email) {
        return json(
          { error: 'Team ID and email are required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Check if team exists
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (team.length === 0) {
        return json({ error: 'Team not found' }, { status: 404 });
      }

      // Check if user already exists with this email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].teamId === teamId) {
        return json(
          { error: 'User is already a member of this team' },
          { status: 409 }
        );
      }

      // Generate invitation token
      const invitationToken = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Store invitation (in production, send email)
      // For now, we'll create a pending user
      const userId = nanoid();
      const now = new Date().toISOString();

      await db.insert(users).values({
        id: userId,
        email,
        name: email.split('@')[0], // Temporary name
        role: role || 'editor',
        teamId,
        preferences: JSON.stringify({
          invitationToken,
          invitationExpiresAt: expiresAt.toISOString(),
          invitedAt: now,
        }),
        createdAt: now,
      });

      // In production, send email here
      console.log(`Invitation sent to ${email} for team ${teamId}`);

      return json({
        success: true,
        message: 'Invitation sent successfully',
        invitation: {
          email,
          role: role || 'editor',
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      return json(
        { error: 'Failed to send invitation' },
        { status: 500 }
      );
    }
  },
});

// Accept invitation
export const AcceptAPIRoute = createAPIFileRoute('/api/invite/accept')({
  POST: async ({ request, env }) => {
    try {
      const { token, name, password } = await request.json();

      if (!token || !name || !password) {
        return json(
          { error: 'Token, name, and password are required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Find user by invitation token
      const user = await db
        .select()
        .from(users)
        .where(eq(users.preferences, JSON.stringify({ invitationToken: token })))
        .limit(1);

      if (user.length === 0) {
        return json({ error: 'Invalid or expired invitation' }, { status: 404 });
      }

      const preferences = JSON.parse(user[0].preferences || '{}');
      
      if (new Date(preferences.invitationExpiresAt) < new Date()) {
        return json({ error: 'Invitation has expired' }, { status: 410 });
      }

      // Update user
      await db
        .update(users)
        .set({
          name,
          preferences: JSON.stringify({
            ...preferences,
            invitationToken: null,
            invitationAcceptedAt: new Date().toISOString(),
          }),
        })
        .where(eq(users.id, user[0].id));

      return json({
        success: true,
        message: 'Invitation accepted successfully',
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      );
    }
  },
});
