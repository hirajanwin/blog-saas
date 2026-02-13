import { json } from '@tanstack/react-start'
import { createDb } from '../../../lib/db'
import { aiBriefs } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

type NewAiBrief = {
  id: string
  teamId: string
  postId: string | null
  keyword: string
  targetWordCount: number
  tone: string
  briefContent: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function GET({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url)
    const teamId = url.searchParams.get('teamId')
    const postId = url.searchParams.get('postId')
    const briefId = url.searchParams.get('briefId')
    
    if (!teamId) {
      return json({ error: 'Team ID is required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    if (briefId) {
      // Get specific brief
      const brief = await db
        .select()
        .from(aiBriefs)
        .where(eq(aiBriefs.id, briefId))
        .limit(1)
      
      if (brief.length === 0) {
        return json({ error: 'Brief not found' }, { status: 404 })
      }
      
      return json({ success: true, brief: brief[0] })
    }
    
    // Get briefs for team or post
    let query = db.select().from(aiBriefs).where(eq(aiBriefs.teamId, teamId))
    
    const briefs = await query.orderBy(aiBriefs.createdAt)
    
    return json({ success: true, briefs })
  } catch (error: any) {
    console.error('Error fetching AI briefs:', error)
    return json({ error: 'Failed to fetch briefs' }, { status: 500 })
  }
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const { teamId, postId, keyword, targetWordCount, tone, settings } = await request.json()
    
    if (!teamId || !keyword) {
      return json({ error: 'Team ID and keyword are required' }, { status: 400 })
    }
    
    const db = createDb(env)
    
    // Generate AI brief
    const briefContent = await generateAIBrief({
      keyword,
      targetWordCount: targetWordCount || 1500,
      tone: tone || 'professional',
      settings
    })
    
    const newBrief: NewAiBrief = {
      id: nanoid(),
      teamId,
      postId: postId || null,
      keyword,
      targetWordCount: targetWordCount || 1500,
      tone: tone || 'professional',
      briefContent: JSON.stringify(briefContent),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await db.insert(aiBriefs).values(newBrief)
    
    return json({
      success: true,
      brief: {
        ...newBrief,
        briefContent
      }
    })
  } catch (error: any) {
    console.error('Error creating AI brief:', error)
    return json({ error: 'Failed to create brief' }, { status: 500 })
  }
}

async function generateAIBrief(params: {
  keyword: string
  targetWordCount: number
  tone: string
  settings?: any
}) {
  // In production, this would call OpenAI/Anthropic API
  // For now, return a structured brief template
  
  const { keyword, targetWordCount, tone } = params
  
  return {
    meta: {
      keyword,
      targetWordCount,
      tone,
      estimatedReadTime: Math.ceil(targetWordCount / 200)
    },
    structure: {
      introduction: {
        wordCount: Math.floor(targetWordCount * 0.15),
        points: [
          'Hook the reader with a compelling statistic or question',
          'Introduce the main topic and why it matters',
          'Preview the key points readers will learn'
        ]
      },
      mainBody: {
        sections: [
          {
            heading: `Understanding ${keyword}`,
            wordCount: Math.floor(targetWordCount * 0.25),
            points: [
              'Define key concepts',
              'Provide background context',
              'Explain why this is relevant now'
            ]
          },
          {
            heading: `Best Practices for ${keyword}`,
            wordCount: Math.floor(targetWordCount * 0.25),
            points: [
              'Actionable tips with examples',
              'Common mistakes to avoid',
              'Expert insights or case studies'
            ]
          },
          {
            heading: `Advanced Strategies`,
            wordCount: Math.floor(targetWordCount * 0.2),
            points: [
              'Pro-level techniques',
              'Industry-specific tips',
              'Future trends'
            ]
          }
        ]
      },
      conclusion: {
        wordCount: Math.floor(targetWordCount * 0.15),
        points: [
          'Summarize key takeaways',
          'Call to action',
          'Encourage engagement'
        ]
      }
    },
    seo: {
      primaryKeyword: keyword,
      suggestedSecondaryKeywords: [
        `${keyword} tips`,
        `${keyword} guide`,
        `how to ${keyword}`,
        `best ${keyword}`
      ],
      metaDescription: `Learn everything about ${keyword} with our comprehensive guide. Expert tips, strategies, and practical advice for success.`,
      suggestedUrlSlug: keyword.toLowerCase().replace(/\s+/g, '-')
    },
    sources: [
      'Industry reports and statistics',
      'Academic research',
      'Expert interviews',
      'Case studies'
    ],
    style: {
      tone,
      voice: tone === 'professional' ? 'authoritative' : 'conversational',
      readabilityLevel: 'intermediate'
    },
    additional: {
      questionsToAnswer: [
        `What is ${keyword}?`,
        `Why is ${keyword} important?`,
        `How can I get started with ${keyword}?`,
        `What are the best practices for ${keyword}?`
      ],
      statisticsToInclude: [
        'Industry growth rates',
        'Success metrics',
        'Benchmark data'
      ],
      examplesToUse: [
        'Real-world case studies',
        'Step-by-step examples',
        'Before/after scenarios'
      ]
    }
  }
}