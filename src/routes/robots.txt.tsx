import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots/txt')('/robots.txt', {
  component: RobotsComponent,
  head: () => ({
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
})

async function RobotsComponent() {
  // This would be dynamically generated based on team/blog settings
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /*.json$

Sitemap: https://your-domain.com/sitemap.xml

User-agent: Googlebot
Allow: /
Disallow: /admin/

User-agent: ChatGPT
Allow: /
Disallow: /admin/`

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}