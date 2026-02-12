import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../../lib/db'
import { teams } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/teams/$teamId')({
  PUT: async ({ params, request, env }) => {
    try {
      const { teamId } = params;
      
      if (!teamId) {
        return json({ error: 'Team ID is required' }, { status: 400 });
      }

      const body = await request.json();
      const { name, description, settings } = body;

      const db = createDb(env as any);

      // Check if team exists
      const existingTeam = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (existingTeam.length === 0) {
        return json({ error: 'Team not found' }, { status: 404 });
      }

      // Update team
      const now = new Date().toISOString();
      const updateData: any = { updatedAt: now };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (settings !== undefined) updateData.settings = JSON.stringify(settings);

      await db
        .update(teams)
        .set(updateData)
        .where(eq(teams.id, teamId));

      return json({
        success: true,
        team: {
          id: teamId,
          name: name || existingTeam[0].name,
          description: description || existingTeam[0].description,
          updatedAt: now,
        },
      });
    } catch (error: any) {
      console.error('Error updating team:', error);
      return json(
        { error: 'Failed to update team. Please try again.' },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ params, env }) => {
    try {
      const { teamId } = params;
      
      if (!teamId) {
        return json({ error: 'Team ID is required' }, { status: 400 });
      }

      const db = createDb(env as any);

      // Check if team exists
      const existingTeam = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (existingTeam.length === 0) {
        return json({ error: 'Team not found' }, { status: 404 });
      }

      // Delete team (this will cascade delete related data)
      await db.delete(teams).where(eq(teams.id, teamId));

      return json({
        success: true,
        message: 'Team deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting team:', error);
      return json(
        { error: 'Failed to delete team. Please try again.' },
        { status: 500 }
      );
    }
  },
})
