import { json } from '@tanstack/react-start'
import { createDb } from '../../../lib/db'
import { 
  usageTracking,
  polarSubscriptions,
  teams,
  type NewUsageTracking
} from '../../../lib/db/schema'
import { eq, and, sum, gt, gte, lt, lte } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url)
    const teamId = url.searchParams.get('teamId')
    const period = url.searchParams.get('period') // YYYY-MM format, defaults to current
    const metric = url.searchParams.get('metric') // ai_credits, api_calls, storage_gb
    
    if (!teamId) {
      return json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }
    
    const db = createDb(env)
    
    // Get current period if not specified
    const currentPeriod = period || new Date().toISOString().slice(0, 7)
    
    // Get subscription info
    const subscription = await db
      .select()
      .from(polarSubscriptions)
      .innerJoin(teams, eq(polarSubscriptions.customerId, teams.id))
      .where(eq(teams.id, teamId))
      .limit(1)
    
    // Get usage for current period
    const usage = await db
      .select({
        metric: usageTracking.metric,
        total: sum(usageTracking.quantity)
      })
      .from(usageTracking)
      .where(and(
        eq(usageTracking.teamId, teamId),
        eq(usageTracking.period, currentPeriod)
      ))
      .groupBy(usageTracking.metric)
    
    // Get plan limits based on subscription
    let limits = {
      aiCredits: 1000, // Free tier
      apiCalls: 1000,
      storageGB: 1,
      customDomains: 0,
      teamMembers: 3
    }
    
    if (subscription.length > 0) {
      const productName = subscription[0].polarSubscriptions?.productName?.toLowerCase() || ''
      if (productName.includes('pro')) {
        limits = {
          aiCredits: 10000,
          apiCalls: 50000,
          storageGB: 10,
          customDomains: 5,
          teamMembers: 10
        }
      } else if (productName.includes('enterprise') || productName.includes('agency')) {
        limits = {
          aiCredits: -1, // Unlimited
          apiCalls: -1,
          storageGB: -1,
          customDomains: -1,
          teamMembers: -1
        }
      }
    }
    
    // Format usage data with percentages
    const usageData = usage.map(u => {
      const currentValue = u.total || 0
      const limit = limits[u.metric as keyof typeof limits] || 0
      const percentage = limit > 0 ? Math.min((currentValue / limit) * 100, 100) : 0
      
      return {
        metric: u.metric,
        used: currentValue,
        limit: limit,
        percentage: Math.round(percentage),
        remaining: limit > 0 ? Math.max(limit - currentValue, 0) : -1,
        isUnlimited: limit === -1
      }
    })
    
    // Add missing metrics with zero usage
    const allMetrics = ['ai_credits', 'api_calls', 'storage_gb', 'custom_domains']
    for (const metric of allMetrics) {
      if (!usageData.find(u => u.metric === metric)) {
        const limit = limits[metric.replace('_gb', 'GB').replace('api_', 'api').replace('ai_', 'ai') as keyof typeof limits] || 0
        usageData.push({
          metric,
          used: 0,
          limit: limit,
          percentage: 0,
          remaining: limit > 0 ? limit : 0,
          isUnlimited: limit === -1
        })
      }
    }
    
    return json({
      success: true,
      period: currentPeriod,
      subscription: subscription[0] ? {
        plan: subscription[0].polarSubscriptions?.productName,
        status: subscription[0].polarSubscriptions?.status
      } : {
        plan: 'Free',
        status: 'active'
      },
      usage: usageData,
      limits
    })
  } catch (error: any) {
    console.error('Usage tracking error:', error)
    return json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const { teamId, metric, quantity, action } = await request.json()
    
    if (!teamId || !metric) {
      return json(
        { error: 'Team ID and metric are required' },
        { status: 400 }
      )
    }
    
    const db = createDb(env)
    const period = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    switch (action) {
      case 'increment':
        // Increment usage (for API calls, AI credits used)
        if (!quantity) {
          return json(
            { error: 'Quantity is required for increment action' },
            { status: 400 }
          )
        }
        
        const newUsage: NewUsageTracking = {
          id: nanoid(),
          teamId,
          metric,
          quantity,
          period,
          recordedAt: new Date().toISOString()
        }
        
        await db.insert(usageTracking).values(newUsage)
        
        return json({
          success: true,
          message: `Incremented ${metric} by ${quantity} for period ${period}`
        })
        
      case 'check':
        // Check if team has enough quota
        const currentUsage = await db
          .select({
            total: sum(usageTracking.quantity)
          })
          .from(usageTracking)
          .where(and(
            eq(usageTracking.teamId, teamId),
            eq(usageTracking.period, period),
            eq(usageTracking.metric, metric)
          ))
        
        // Get subscription limits
        const subscription = await db
          .select()
          .from(polarSubscriptions)
          .innerJoin(teams, eq(polarSubscriptions.customerId, teams.id))
          .where(eq(teams.id, teamId))
          .limit(1)
        
        let limit = 1000 // Free tier default
        if (subscription.length > 0) {
          const productName = subscription[0].polarSubscriptions?.productName?.toLowerCase() || ''
          if (productName.includes('pro')) {
            limit = 10000
          } else if (productName.includes('enterprise') || productName.includes('agency')) {
            limit = -1 // Unlimited
          }
        }
        
        const used = currentUsage[0]?.total || 0
        const remaining = limit > 0 ? Math.max(limit - used, 0) : -1
        
        return json({
          success: true,
          allowed: limit === -1 || remaining >= (quantity || 0),
          used,
          limit,
          remaining,
          period
        })
        
      case 'reset':
        // Reset usage for a period (admin only)
        // In production, add admin authentication check
        if (!period) {
          return json(
            { error: 'Period is required for reset action' },
            { status: 400 }
          )
        }
        
        await db
          .delete(usageTracking)
          .where(and(
            eq(usageTracking.teamId, teamId),
            eq(usageTracking.period, period)
          ))
        
        return json({
          success: true,
          message: `Reset usage for ${period}`
        })
        
      default:
        return json(
          { error: 'Invalid action. Use: increment, check, or reset' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Usage tracking POST error:', error)
    return json(
      { error: 'Failed to process usage request' },
      { status: 500 }
    )
  }
}