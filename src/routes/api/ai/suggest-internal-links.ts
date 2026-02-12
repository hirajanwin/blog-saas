import { json } from '@tanstack/react-start'
import { createAPIRoute } from '@tanstack/react-start/api'
import { createDb } from '../../../lib/db'
import { getAllPostsForBlog } from '../../../lib/db'
import { suggestInternalLinks } from '../../../lib/ai'

export const APIRoute = createAPIRoute({
  POST: async ({ request, env }) => {
    const { blogId, content } = await request.json()
    const db = createDb(env as any)

    if (!blogId || !content) {
      return json({ error: 'Missing blogId or content' }, 400)
    }

    try {
      const allPosts = await getAllPostsForBlog(db, blogId)
      const suggestions = await suggestInternalLinks(content, allPosts)
      return json(suggestions)
    } catch (error) {
      console.error('Error suggesting internal links:', error)
      return json({ error: 'Failed to suggest internal links' }, 500)
    }
  },
})
