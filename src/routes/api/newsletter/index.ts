import { json } from '@tanstack/react-start'
import { createDb } from '../../../lib/db'
import { newsletterSubscribers, emailCampaigns, posts } from '../../../lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url)
    const blogId = url.searchParams.get('blogId')
    const action = url.searchParams.get('action')
    
    if (!blogId) {
      return json({ error: 'Blog ID is required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    switch (action) {
      case 'subscribers':
        const subscribers = await db
          .select()
          .from(newsletterSubscribers)
          .where(eq(newsletterSubscribers.blogId, blogId))
          .orderBy(desc(newsletterSubscribers.subscribedAt))
        
        const stats = {
          total: subscribers.length,
          active: subscribers.filter(s => s.status === 'active').length,
          unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
          bounced: subscribers.filter(s => s.status === 'bounced').length
        }
        
        return json({ success: true, subscribers, stats })
      
      case 'campaigns':
        const campaigns = await db
          .select()
          .from(emailCampaigns)
          .where(eq(emailCampaigns.blogId, blogId))
          .orderBy(desc(emailCampaigns.createdAt))
        
        return json({ success: true, campaigns })
      
      default:
        // Get overview
        const [subscriberCount, campaignCount, recentSubscribers] = await Promise.all([
          db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.blogId, blogId)),
          db.select().from(emailCampaigns).where(eq(emailCampaigns.blogId, blogId)),
          db.select().from(newsletterSubscribers)
            .where(eq(newsletterSubscribers.blogId, blogId))
            .orderBy(desc(newsletterSubscribers.subscribedAt))
            .limit(5)
        ])
        
        return json({
          success: true,
          overview: {
            totalSubscribers: subscriberCount.length,
            activeSubscribers: subscriberCount.filter(s => s.status === 'active').length,
            totalCampaigns: campaignCount.length,
            avgOpenRate: campaignCount.length > 0 
              ? Math.round(campaignCount.reduce((sum, c) => sum + (c.openCount / Math.max(c.sentCount, 1)), 0) / campaignCount.length * 100)
              : 0,
            avgClickRate: campaignCount.length > 0
              ? Math.round(campaignCount.reduce((sum, c) => sum + (c.clickCount / Math.max(c.sentCount, 1)), 0) / campaignCount.length * 100)
              : 0
          },
          recentSubscribers
        })
    }
  } catch (error: any) {
    console.error('Newsletter error:', error)
    return json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const { blogId, action, data } = await request.json()
    
    if (!blogId) {
      return json({ error: 'Blog ID is required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    switch (action) {
      case 'subscribe':
        // Add subscriber
        const existing = await db
          .select()
          .from(newsletterSubscribers)
          .where(and(
            eq(newsletterSubscribers.blogId, blogId),
            eq(newsletterSubscribers.email, data.email)
          ))
          .limit(1)
        
        if (existing.length > 0) {
          // Update existing
          await db
            .update(newsletterSubscribers)
            .set({ status: 'active', unsubscribedAt: null })
            .where(eq(newsletterSubscribers.id, existing[0].id))
          
          return json({ success: true, message: 'Subscribed successfully' })
        }
        
        const newSubscriber = {
          id: nanoid(),
          blogId,
          email: data.email,
          name: data.name,
          status: 'active',
          source: data.source || 'signup_form',
          tags: data.tags ? JSON.stringify(data.tags) : null,
          subscribedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        
        await db.insert(newsletterSubscribers).values(newSubscriber)
        
        return json({ success: true, message: 'Subscribed successfully' })
      
      case 'unsubscribe':
        await db
          .update(newsletterSubscribers)
          .set({ 
            status: 'unsubscribed',
            unsubscribedAt: new Date().toISOString()
          })
          .where(eq(newsletterSubscribers.email, data.email))
        
        return json({ success: true, message: 'Unsubscribed successfully' })
      
      case 'create_campaign':
        // Create email campaign
        const campaign = {
          id: nanoid(),
          blogId,
          name: data.name,
          subject: data.subject,
          content: data.content,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.insert(emailCampaigns).values(campaign)
        
        return json({ success: true, campaign })
      
      case 'send_campaign':
        // Get campaign
        const emailCampaign = await db
          .select()
          .from(emailCampaigns)
          .where(eq(emailCampaigns.id, data.campaignId))
          .limit(1)
        
        if (emailCampaign.length === 0) {
          return json({ error: 'Campaign not found' }, { status: 404 })
        }
        
        // Get subscribers
        const subscribers = await db
          .select()
          .from(newsletterSubscribers)
          .where(and(
            eq(newsletterSubscribers.blogId, blogId),
            eq(newsletterSubscribers.status, 'active')
          ))
        
        // Update campaign with recipient count
        await db
          .update(emailCampaigns)
          .set({ 
            status: 'sent',
            recipientCount: subscribers.length,
            sentCount: subscribers.length,
            sentAt: new Date().toISOString()
          })
          .where(eq(emailCampaigns.id, data.campaignId))
        
        // In production, this would trigger email service (SendGrid, Mailgun, etc.)
        
        return json({ 
          success: true, 
          message: `Campaign sent to ${subscribers.length} subscribers` 
        })
      
      case 'auto_send':
        // Auto-send new blog posts to subscribers
        const { postId } = data
        
        const post = await db
          .select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1)
        
        if (post.length === 0) {
          return json({ error: 'Post not found' }, { status: 404 })
        }
        
        // Create campaign for this post
        const autoCampaign = {
          id: nanoid(),
          blogId,
          name: `New post: ${post[0].title}`,
          subject: `📝 New article: ${post[0].title}`,
          content: generateNewsletterContent(post[0].title, post[0].excerpt || '', post[0].slug),
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.insert(emailCampaigns).values(autoCampaign)
        
        return json({ 
          success: true, 
          campaign: autoCampaign,
          message: 'Newsletter campaign created. Review and send to subscribers.' 
        })
      
      default:
        return json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Newsletter POST error:', error)
    return json({ error: 'Failed to process request' }, { status: 500 })
  }
}

function generateNewsletterContent(title: string, excerpt: string, slug: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1a1a1a; margin-bottom: 10px;">${title}</h1>
    <p style="color: #666; font-size: 16px;">${excerpt}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="#" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Read Full Article
    </a>
  </div>
  
  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
    <p>You're receiving this because you subscribed to our newsletter.</p>
    <p>
      <a href="#" style="color: #666;">Unsubscribe</a> | 
      <a href="#" style="color: #666;">View in browser</a>
    </p>
  </div>
</body>
</html>`
}