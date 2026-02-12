import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../lib/db'
import { blogs, teams } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/blogs')({
  POST: async ({ request, env }) => {
    try {
      const { teamId, title, description, primaryColor, language } = await request.json();

      // Validate required fields
      if (!teamId || !title) {
        return json(
          { error: 'Team ID and title are required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      // Verify team exists
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (team.length === 0) {
        return json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      // Create blog
      const blogId = nanoid();
      const now = new Date().toISOString();

      await db.insert(blogs).values({
        id: blogId,
        teamId,
        title,
        description: description || null,
        defaultLanguage: language || 'en',
        languages: JSON.stringify([language || 'en']),
        themeSettings: JSON.stringify({
          primaryColor: primaryColor || '#3b82f6',
          fontFamily: 'system-ui',
          layout: 'standard',
        }),
        seoSettings: JSON.stringify({
          metaTitle: title,
          metaDescription: description || `Welcome to ${title}`,
        }),
        aiSettings: JSON.stringify({
          tone: 'professional',
          style: 'informative',
        }),
        createdAt: now,
      });

      return json({
        success: true,
        blog: {
          id: blogId,
          title,
          description,
          teamId,
          createdAt: now,
        },
      });
    } catch (error: any) {
      console.error('Error creating blog:', error);
      return json(
        { error: 'Failed to create blog. Please try again.' },
        { status: 500 }
      );
    }
  },

  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url);
      const teamId = url.searchParams.get('teamId');

      if (!teamId) {
        return json(
          { error: 'Team ID is required' },
          { status: 400 }
        );
      }

      const db = createDb(env as any);

      const blogsList = await db
        .select()
        .from(blogs)
        .where(eq(blogs.teamId, teamId))
        .orderBy(blogs.createdAt);

      return json({
        success: true,
        blogs: blogsList,
      });
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      return json(
        { error: 'Failed to fetch blogs. Please try again.' },
        { status: 500 }
      );
    }
  },
})
