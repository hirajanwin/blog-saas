import { json } from '@tanstack/react-start'
import { createDb } from '../../../lib/db'
import { repurposedContent, posts } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

interface PlatformConfig {
  twitter: { maxLength: number, hasMedia: boolean }
  linkedin: { maxLength: number, hasMedia: boolean }
  facebook: { maxLength: number, hasMedia: boolean }
  newsletter: { maxLength: number }
  medium: { maxLength: number }
}

const PLATFORM_CONFIG: PlatformConfig = {
  twitter: { maxLength: 280, hasMedia: true },
  linkedin: { maxLength: 3000, hasMedia: true },
  facebook: { maxLength: 63206, hasMedia: true },
  newsletter: { maxLength: 100000, hasMedia: false },
  medium: { maxLength: 100000, hasMedia: false }
}

export async function GET({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url)
    const teamId = url.searchParams.get('teamId')
    const postId = url.searchParams.get('postId')
    
    if (!teamId) {
      return json({ error: 'Team ID is required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    let query = db
      .select()
      .from(repurposedContent)
      .where(eq(repurposedContent.teamId, teamId))
    
    if (postId) {
      query = db
        .select()
        .from(repurposedContent)
        .where(eq(repurposedContent.originalPostId, postId))
    }
    
    const content = await query.orderBy(repurposedContent.createdAt)
    
    return json({ success: true, content })
  } catch (error: any) {
    console.error('Error fetching repurposed content:', error)
    return json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const { teamId, postId, platforms, customContent } = await request.json()
    
    if (!teamId || !postId || !platforms?.length) {
      return json({ 
        error: 'Team ID, post ID, and platforms are required' 
      }, { status: 400 })
    }
    
    const db = createDb(env)
    
    // Get original post
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)
    
    if (post.length === 0) {
      return json({ error: 'Post not found' }, { status: 404 })
    }
    
    const originalPost = post[0]
    const results = []
    
    for (const platform of platforms) {
      const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
      
      // Generate content based on platform
      let content = customContent?.[platform]
      
      if (!content) {
        content = await generatePlatformContent(
          originalPost.title,
          originalPost.excerpt || originalPost.content.substring(0, 200),
          platform,
          config
        )
      }
      
      const newContent = {
        id: nanoid(),
        teamId,
        originalPostId: postId,
        platform,
        content,
        status: 'draft',
        createdAt: new Date().toISOString()
      }
      
      await db.insert(repurposedContent).values(newContent)
      results.push({ platform, content, ...newContent })
    }
    
    return json({ success: true, results })
  } catch (error: any) {
    console.error('Error creating repurposed content:', error)
    return json({ error: 'Failed to create content' }, { status: 500 })
  }
}

async function generatePlatformContent(
  title: string,
  excerpt: string,
  platform: string,
  config: any
): Promise<string> {
  // In production, use AI to generate platform-specific content
  // For now, generate template-based content
  
  switch (platform) {
    case 'twitter':
      return generateTwitterThread(title, excerpt, config.maxLength)
    case 'linkedin':
      return generateLinkedInPost(title, excerpt, config.maxLength)
    case 'facebook':
      return generateFacebookPost(title, excerpt, config.maxLength)
    case 'newsletter':
      return generateNewsletter(title, excerpt, config.maxLength)
    case 'medium':
      return generateMediumPost(title, excerpt, config.maxLength)
    default:
      return excerpt
  }
}

function generateTwitterThread(title: string, excerpt: string, maxLength: number): string {
  const tweets = [
    `🧵 New article: "${title}"\n\nHere's what you'll learn:`,
    `1️⃣ The problem we're solving\n\n${excerpt.substring(0, 200)}...`,
    `2️⃣ Key insights from the research\n\nThe data shows something interesting about this topic.`,
    `3️⃣ Actionable takeaways\n\nHere's what you can do starting today:`,
    `4️⃣ Why this matters\n\nThis isn't just theory - it's been tested with real results.`,
    `5️⃣ What's next\n\nReady to dive deeper? Check out the full article link in comments 👇`
  ]
  
  return JSON.stringify(tweets)
}

function generateLinkedInPost(title: string, excerpt: string, maxLength: number): string {
  return `📝 New Article: "${title}"

I've been exploring this topic for a while now, and I'm excited to share my findings with you.

Key takeaways:
• The landscape is changing rapidly
• There are new opportunities to explore
• Action beats analysis every time

Here's the thing - most people talk about theory. I prefer to focus on what actually works.

The full article breaks down:
→ The data behind these trends
→ Real-world case studies
→ Practical steps you can take today

What are your thoughts on this topic? I'd love to hear your perspective.

#ContentMarketing #Growth #Leadership`
}

function generateFacebookPost(title: string, excerpt: string, maxLength: number): string {
  return `📰 Just published: "${title}"

This has been on my mind for a while, and I'm happy to finally share it with you all.

A sneak peek:
- Key insights from my research
- What the data tells us
- Actionable next steps

Drop a 💡 in the comments if you find this useful!

👉 Read the full article: [link in bio]`
}

function generateNewsletter(title: string, excerpt: string, maxLength: number): string {
  return `Hey there!

I'm excited to share my latest article with you: "${title}"

In this piece, I dive deep into:

📌 The main problem we're addressing
📌 Key insights from research
📌 Practical strategies you can use

Here's a preview:
"${excerpt.substring(0, 300)}..."

This has been one of my most researched pieces yet, and I hope it brings you as much value as it brought me while writing it.

Want to read the full article? Click the button below 👇

[Read Article]
    
Until next time,
[Your Name]

P.S. Reply to this email with any questions or thoughts - I'd love to hear from you!`
}

function generateMediumPost(title: string, excerpt: string, maxLength: number): string {
  return `# ${title}

${excerpt}

---

## Introduction

The topic we're covering today has been misunderstood for too long. Let me break it down into digestible pieces.

## The Core Problem

Every expert has a different take on this subject. Here's what the research actually shows:

- Finding #1
- Finding #2  
- Finding #3

## Solutions That Work

Based on my experience and research, here are the approaches that consistently deliver results:

### Approach 1: Start Small

The best way to begin is...

### Approach 2: Iterate Quickly

Don't wait for perfection...

## The Bottom Line

Here's what it all comes down to:

1. Take action
2. Measure results
3. Adjust and improve

---

Thanks for reading! If you found this valuable, please clap 👏 and share with others who might benefit.

Follow for more insights on this topic.`
}