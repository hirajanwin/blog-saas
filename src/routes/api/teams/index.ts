import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../../lib/db'
import { teams, users, blogs } from '../../../lib/db/schema'

export const APIRoute = createAPIFileRoute('/api/teams')({
  POST: async ({ request, env }) => {
    try {
      const { name, subdomain, userName, userEmail } = await request.json()

      // Validate required fields
      if (!name || !subdomain || !userName || !userEmail) {
        return json(
          { error: 'All fields are required' },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userEmail)) {
        return json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }

      const db = createDb(env as any)

      // Create team
      const teamId = nanoid()
      const now = new Date().toISOString()

      await db.insert(teams).values({
        id: teamId,
        name,
        subdomain,
        planType: 'free',
        aiCreditsMonthly: 100,
        settings: JSON.stringify({
          theme: 'default',
          seoDefaults: {
            metaTitleTemplate: '%title% | %siteName%',
            metaDescriptionLength: 160,
          },
        }),
        createdAt: now,
      })

      // Create user
      const userId = nanoid()
      await db.insert(users).values({
        id: userId,
        email: userEmail,
        name: userName,
        role: 'admin',
        teamId,
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
      })

      // Create default blog
      const blogId = nanoid()
      await db.insert(blogs).values({
        id: blogId,
        teamId,
        title: `${name} Blog`,
        description: `Welcome to ${name}'s blog`,
        defaultLanguage: 'en',
        languages: JSON.stringify(['en']),
        themeSettings: JSON.stringify({
          primaryColor: '#3b82f6',
          fontFamily: 'system-ui',
          layout: 'standard',
        }),
        seoSettings: JSON.stringify({
          metaTitle: `${name} Blog`,
          metaDescription: `Welcome to ${name}'s blog`,
        }),
        aiSettings: JSON.stringify({
          tone: 'professional',
          style: 'informative',
        }),
        createdAt: now,
      })

      return json({
        success: true,
        team: {
          id: teamId,
          name,
          subdomain,
        },
        blog: {
          id: blogId,
          title: `${name} Blog`,
        },
        user: {
          id: userId,
          email: userEmail,
          name: userName,
        },
      })
    } catch (error: any) {
      console.error('Error creating team:', error)
      
      // Check for unique constraint violation
      if (error.message?.includes('UNIQUE constraint failed')) {
        return json(
          { error: 'This subdomain or email is already in use' },
          { status: 409 }
        )
      }

      return json(
        { error: 'Failed to create team. Please try again.' },
        { status: 500 }
      )
    }
  },
})
