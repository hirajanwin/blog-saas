import { json } from '@tanstack/react-start'
import { createDb } from '../../../lib/db'
import { socialConnections, socialPosts, posts } from '../../../lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url)
    const teamId = url.searchParams.get('teamId')
    const platform = url.searchParams.get('platform')
    
    if (!teamId) {
      return json({ error: 'Team ID is required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    // Get social connections
    let connectionsQuery = db
      .select()
      .from(socialConnections)
      .where(eq(socialConnections.teamId, teamId))
    
    if (platform) {
      connectionsQuery = db
        .select()
        .from(socialConnections)
        .where(and(
          eq(socialConnections.teamId, teamId),
          eq(socialConnections.platform, platform)
        ))
    }
    
    const connections = await connectionsQuery
    
    // Get scheduled posts
    const scheduledPosts = await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.teamId, teamId))
      .orderBy(socialPosts.scheduledAt)
      .limit(20)
    
    return json({ 
      success: true, 
      connections,
      scheduledPosts 
    })
  } catch (error: any) {
    console.error('Error fetching social data:', error)
    return json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const { teamId, action, data } = await request.json()
    
    if (!teamId) {
      return json({ error: 'Team ID is required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    switch (action) {
      case 'connect':
        // Store OAuth connection (in production, complete OAuth flow)
        const newConnection = {
          id: nanoid(),
          teamId,
          platform: data.platform,
          accountId: data.accountId,
          accountName: data.accountName,
          accessToken: data.accessToken, // In production, encrypt this
          refreshToken: data.refreshToken,
          tokenExpiresAt: data.tokenExpiresAt,
          profileImage: data.profileImage,
          followers: data.followers || 0,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.insert(socialConnections).values(newConnection)
        
        return json({ success: true, connection: newConnection })
      
      case 'disconnect':
        // Deactivate connection
        await db
          .update(socialConnections)
          .set({ active: false })
          .where(eq(socialConnections.id, data.connectionId))
        
        return json({ success: true })
      
      case 'schedule':
        // Schedule a post
        const { postId, platform, content, mediaUrls, scheduledAt } = data
        
        // Get post info if linking
        let postTitle = ''
        if (postId) {
          const post = await db
            .select()
            .from(posts)
            .where(eq(posts.id, postId))
            .limit(1)
          
          if (post.length > 0) {
            postTitle = post[0].title
          }
        }
        
        const newPost = {
          id: nanoid(),
          teamId,
          postId: postId || null,
          platform,
          content,
          mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
          status: 'scheduled',
          scheduledAt: scheduledAt || new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        
        await db.insert(socialPosts).values(newPost)
        
        return json({ success: true, post: newPost })
      
      case 'publish_now':
        // Publish immediately (would trigger actual API call to platform)
        await db
          .update(socialPosts)
          .set({ 
            status: 'published',
            publishedAt: new Date().toISOString()
          })
          .where(eq(socialPosts.id, data.postId))
        
        return json({ success: true })
      
      case 'auto_post':
        // Auto-post when blog post is published
        const { blogPostId, platforms: targetPlatforms } = data
        
        // Get blog post
        const blogPost = await db
          .select()
          .from(posts)
          .where(eq(posts.id, blogPostId))
          .limit(1)
        
        if (blogPost.length === 0) {
          return json({ error: 'Post not found' }, { status: 404 })
        }
        
        const post = blogPost[0]
        
        // Generate social content for each platform
        for (const plat of targetPlatforms) {
          const socialContent = generateSocialContent(post.title, post.excerpt || '', plat)
          
          const autoPost = {
            id: nanoid(),
            teamId,
            postId: blogPostId,
            platform: plat,
            content: socialContent,
            status: 'scheduled',
            scheduledAt: new Date().toISOString(), // Post immediately
            createdAt: new Date().toISOString()
          }
          
          await db.insert(socialPosts).values(autoPost)
        }
        
        return json({ success: true, message: `Auto-posts scheduled for ${targetPlatforms.length} platforms` })
      
      default:
        return json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Social action error:', error)
    return json({ error: 'Failed to process request' }, { status: 500 })
  }
}

function generateSocialContent(title: string, excerpt: string, platform: string): string {
  const shortTitle = title.length > 60 ? title.substring(0, 57) + '...' : title
  
  switch (platform) {
    case 'twitter':
      return `📝 New article: "${shortTitle}"\n\n${excerpt.substring(0, 100)}...\n\n#Content #Blog`
    
    case 'linkedin':
      return `Excited to share my latest article: "${title}"\n\n${excerpt.substring(0, 200)}...\n\n#Professional #Insights #Content`
    
    case 'facebook':
      return `📰 Just published: "${title}"\n\n${excerpt.substring(0, 150)}...\n\nClick to read more!`
    
    case 'instagram':
      return `New blog post! 📝\n\n"${shortTitle}"\n\nLink in bio 🔗\n\n#Blog #NewPost #Content`
    
    default:
      return `${title}\n\n${excerpt}`
  }
}