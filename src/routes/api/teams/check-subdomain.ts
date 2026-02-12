import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../../lib/db'
import { teams } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/teams/check-subdomain')({
  POST: async ({ request, env }) => {
    try {
      const { subdomain } = await request.json()

      if (!subdomain) {
        return json({ error: 'Subdomain is required' }, { status: 400 })
      }

      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9-]+$/
      if (!subdomainRegex.test(subdomain)) {
        return json(
          { error: 'Subdomain must contain only lowercase letters, numbers, and hyphens' },
          { status: 400 }
        )
      }

      if (subdomain.length < 3 || subdomain.length > 30) {
        return json(
          { error: 'Subdomain must be between 3 and 30 characters' },
          { status: 400 }
        )
      }

      // Check reserved subdomains
      const reservedSubdomains = [
        'www', 'api', 'admin', 'app', 'blog', 'docs', 'help', 'support',
        'mail', 'email', 'ftp', 'smtp', 'imap', 'pop', 'localhost',
        'test', 'demo', 'staging', 'production', 'dev', 'development',
        'api', 'graphql', 'rest', 'graphql', 'cdn', 'static', 'assets'
      ]

      if (reservedSubdomains.includes(subdomain.toLowerCase())) {
        return json(
          { error: 'This subdomain is reserved and cannot be used' },
          { status: 400 }
        )
      }

      // Check if subdomain exists in database
      const db = createDb(env as any)
      const existingTeam = await db
        .select()
        .from(teams)
        .where(eq(teams.subdomain, subdomain))
        .limit(1)

      if (existingTeam.length > 0) {
        return json(
          { error: 'This subdomain is already taken' },
          { status: 409 }
        )
      }

      return json({ available: true, subdomain })
    } catch (error) {
      console.error('Error checking subdomain:', error)
      return json(
        { error: 'Failed to check subdomain availability' },
        { status: 500 }
      )
    }
  },
})
