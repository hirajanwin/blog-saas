import { json } from '@tanstack/react-start'
import { createDb } from '../../../lib/db'
import { 
  agencyClients,
  clientTeamAssignments,
  whiteLabelSettings,
  agencyBilling,
  agencyBulkOperations,
  teams,
  users,
  blogs,
  type NewAgencyClient,
  type NewClientTeamAssignment,
  type NewWhiteLabelSetting,
  type NewAgencyBilling,
  type NewAgencyBulkOperation
} from '../../../lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url)
    const agencyId = url.searchParams.get('agencyId')
    const clientId = url.searchParams.get('clientId')
    const action = url.searchParams.get('action') // 'clients', 'billing', 'operations', 'branding'
    
    if (!agencyId) {
      return json(
        { error: 'Agency ID is required' },
        { status: 400 }
      )
    }
    
    const db = createDb(env)
    
    switch (action) {
      case 'clients':
        // Get agency clients
        if (clientId) {
          // Get specific client with team assignments
          const client = await db
            .select({
              client: agencyClients,
              assignments: {
                team: {
                  id: teams.id,
                  name: teams.name,
                  subdomain: teams.subdomain,
                  planType: teams.planType
                },
                role: clientTeamAssignments.role,
                permissions: clientTeamAssignments.permissions
              }
            })
            .from(agencyClients)
            .leftJoin(clientTeamAssignments, eq(agencyClients.id, clientTeamAssignments.clientId))
            .leftJoin(teams, eq(clientTeamAssignments.teamId, teams.id))
            .where(and(
              eq(agencyClients.id, clientId),
              eq(agencyClients.agencyId, agencyId)
            ))
            .limit(1)
          
          return json({
            success: true,
            client: client[0] || null
          })
        } else {
          // Get all clients
          const clients = await db
            .select()
            .from(agencyClients)
            .where(eq(agencyClients.agencyId, agencyId))
            .orderBy(desc(agencyClients.createdAt))
          
          return json({
            success: true,
            clients: clients
          })
        }
        
      case 'billing':
        // Get agency billing data
        const billing = await db
          .select({
            billing: agencyBilling,
            client: {
              id: agencyClients.id,
              clientName: agencyClients.clientName,
              clientEmail: agencyClients.clientEmail
            }
          })
          .from(agencyBilling)
          .leftJoin(agencyClients, eq(agencyBilling.clientId, agencyClients.id))
          .where(eq(agencyBilling.agencyId, agencyId))
          .orderBy(desc(agencyBilling.billingPeriod))
          .limit(50)
        
        // Calculate totals
        const totalRevenue = billing.reduce((sum, item) => sum + (item.billing?.totalRevenue || 0), 0)
        const totalProfit = billing.reduce((sum, item) => sum + (item.billing?.agencyProfit || 0), 0)
        const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
        
        return json({
          success: true,
          billing: billing,
          summary: {
            totalRevenue,
            totalProfit,
            avgProfitMargin,
            activeClients: billing.filter(item => item.billing?.status === 'paid').length
          }
        })
        
      case 'operations':
        // Get agency bulk operations
        const operations = await db
          .select()
          .from(agencyBulkOperations)
          .where(eq(agencyBulkOperations.agencyId, agencyId))
          .orderBy(desc(agencyBulkOperations.createdAt))
          .limit(20)
        
        return json({
          success: true,
          operations: operations
        })
        
      case 'branding':
        // Get white-label settings
        const branding = await db
          .select()
          .from(whiteLabelSettings)
          .where(eq(whiteLabelSettings.teamId, agencyId))
          .limit(1)
        
        return json({
          success: true,
          branding: branding[0] || null
        })
        
      default:
        // Get agency overview
        const clients = await db
          .select()
          .from(agencyClients)
          .where(eq(agencyClients.agencyId, agencyId))
        
        const activeOperations = await db
          .select()
          .from(agencyBulkOperations)
          .where(and(
            eq(agencyBulkOperations.agencyId, agencyId),
            eq(agencyBulkOperations.status, 'in_progress')
          ))
        
        return json({
          success: true,
          overview: {
            totalClients: clients.length,
            activeOperations: activeOperations.length,
            monthlyRevenue: clients.reduce((sum, client) => sum + (client.monthlyFee || 0), 0),
            activeClients: clients.filter(client => client.status === 'active').length
          }
        })
    }
  } catch (error: any) {
    console.error('Agency management error:', error)
    return json(
      { error: 'Agency management failed' },
      { status: 500 }
    )
  }
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const { agencyId, action, data } = await request.json()
    
    if (!agencyId) {
      return json(
        { error: 'Agency ID is required' },
        { status: 400 }
      )
    }
    
    const db = createDb(env)
    
    switch (action) {
      case 'create_client':
        // Create new agency client
        if (!data.clientName || !data.clientEmail) {
          return json(
            { error: 'Client name and email are required' },
            { status: 400 }
          )
        }
        
        const newClient: NewAgencyClient = {
          id: nanoid(),
          agencyId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          clientCompany: data.clientCompany,
          status: 'active',
          monthlyFee: data.monthlyFee || 0,
          notes: data.notes,
          metadata: JSON.stringify(data.metadata || {}),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.insert(agencyClients).values(newClient)
        
        // Create team for client if requested
        if (data.createTeam && data.teamName) {
          const teamId = nanoid()
          await db.insert(teams).values({
            id: teamId,
            name: data.teamName,
            subdomain: data.subdomain || data.clientName.toLowerCase().replace(/\s+/g, '-'),
            planType: data.planType || 'free',
            aiCreditsMonthly: data.aiCreditsMonthly || 100,
            settings: JSON.stringify({
              agencyManaged: true,
              clientId: newClient.id
            }),
            createdAt: new Date().toISOString()
          })
          
          // Create team assignment
          const newAssignment: NewClientTeamAssignment = {
            id: nanoid(),
            clientId: newClient.id,
            teamId,
            role: 'client',
            permissions: JSON.stringify({
              canViewContent: true,
              canEditContent: data.canEditContent || false,
              canManageUsers: false,
              canManageBilling: false
            }),
            assignedAt: new Date().toISOString()
          }
          
          await db.insert(clientTeamAssignments).values(newAssignment)
          
          // Create default user for client
          const userId = nanoid()
          await db.insert(users).values({
            id: userId,
            email: data.clientEmail,
            name: data.clientName,
            role: 'admin',
            teamId,
            preferences: JSON.stringify({
              notifications: {
                email: true,
                browser: true
              }
            }),
            createdAt: new Date().toISOString()
          })
          
          // Create default blog
          const blogId = nanoid()
          await db.insert(blogs).values({
            id: blogId,
            teamId,
            title: `${data.clientName} Blog`,
            description: `Welcome to ${data.clientName}'s blog`,
            defaultLanguage: 'en',
            languages: JSON.stringify(['en']),
            themeSettings: JSON.stringify({
              primaryColor: data.primaryColor || '#3b82f6',
              fontFamily: 'system-ui',
              layout: 'standard'
            }),
            seoSettings: JSON.stringify({
              metaTitle: `${data.clientName} Blog`,
              metaDescription: `Welcome to ${data.clientName}'s blog`
            }),
            createdAt: new Date().toISOString()
          })
          
          return json({
            success: true,
            client: newClient,
            team: {
              id: teamId,
              name: data.teamName,
              subdomain: data.subdomain
            },
            blog: {
              id: blogId,
              title: `${data.clientName} Blog`
            }
          })
        }
        
        return json({
          success: true,
          client: newClient
        })
        
      case 'update_branding':
        // Update white-label settings
        const existingBranding = await db
          .select()
          .from(whiteLabelSettings)
          .where(eq(whiteLabelSettings.teamId, agencyId))
          .limit(1)
        
        const brandingData = {
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          customCss: data.customCss,
          customDomain: data.customDomain,
          removePolarBranding: data.removePolarBranding || false,
          customFooterHtml: data.customFooterHtml,
          customHeaderHtml: data.customHeaderHtml,
          emailSettings: JSON.stringify(data.emailSettings || {}),
          updatedAt: new Date().toISOString()
        }
        
        if (existingBranding.length > 0) {
          await db
            .update(whiteLabelSettings)
            .set(brandingData)
            .where(eq(whiteLabelSettings.teamId, agencyId))
        } else {
          const newBranding: NewWhiteLabelSetting = {
            id: nanoid(),
            teamId: agencyId,
            ...brandingData,
            createdAt: new Date().toISOString()
          }
          await db.insert(whiteLabelSettings).values(newBranding)
        }
        
        return json({ success: true })
        
      case 'start_operation':
        // Start bulk operation
        if (!data.operationType || !data.totalItems) {
          return json(
            { error: 'Operation type and total items are required' },
            { status: 400 }
          )
        }
        
        const newOperation: NewAgencyBulkOperation = {
          id: nanoid(),
          agencyId,
          operationType: data.operationType,
          status: 'pending',
          progress: 0,
          totalItems: data.totalItems,
          completedItems: 0,
          settings: JSON.stringify(data.settings || {}),
          results: JSON.stringify({}),
          createdAt: new Date().toISOString()
        }
        
        await db.insert(agencyBulkOperations).values(newOperation)
        
        // Simulate operation processing (in production, use background jobs)
        processBulkOperation(db, newOperation.id, data.operationType, data.settings)
        
        return json({
          success: true,
          operation: newOperation
        })
        
      case 'generate_billing':
        // Generate monthly billing
        const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM
        const clients = await db
          .select()
          .from(agencyClients)
          .where(eq(agencyClients.agencyId, agencyId))
        
        for (const client of clients) {
          if (client.monthlyFee && client.monthlyFee > 0) {
            // Calculate fees (in production, use actual Polar data)
            const polarFeePercent = 0.05 // 5% Polar fee
            const polarFees = Math.floor(client.monthlyFee * polarFeePercent)
            const agencyProfit = client.monthlyFee - polarFees
            const profitMarginPercent = Math.floor((agencyProfit / client.monthlyFee) * 100)
            
            const newBilling: NewAgencyBilling = {
              id: nanoid(),
              agencyId,
              clientId: client.id,
              billingPeriod: currentPeriod,
              totalRevenue: client.monthlyFee,
              polarFees,
              agencyProfit,
              profitMarginPercent,
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            
            await db.insert(agencyBilling).values(newBilling)
          }
        }
        
        return json({
          success: true,
          message: `Billing generated for ${clients.length} clients`
        })
        
      default:
        return json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Agency management POST error:', error)
    return json(
      { error: 'Agency management failed' },
      { status: 500 }
    )
  }
}

// Simulate bulk operation processing
async function processBulkOperation(db: any, operationId: string, operationType: string, settings: any) {
  try {
    // Update status to in_progress
    await db
      .update(agencyBulkOperations)
      .set({
        status: 'in_progress',
        startedAt: new Date().toISOString()
      })
      .where(eq(agencyBulkOperations.id, operationId))
    
    // Simulate work with progress updates
    const totalSteps = 10
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second per step
      
      const progress = Math.floor((i / totalSteps) * 100)
      await db
        .update(agencyBulkOperations)
        .set({
          progress,
          completedItems: i
        })
        .where(eq(agencyBulkOperations.id, operationId))
    }
    
    // Complete operation
    await db
      .update(agencyBulkOperations)
      .set({
        status: 'completed',
        progress: 100,
        completedItems: totalSteps,
        completedAt: new Date().toISOString(),
        results: JSON.stringify({
          success: true,
          processed: totalSteps,
          errors: 0,
          duration: totalSteps * 1000
        })
      })
      .where(eq(agencyBulkOperations.id, operationId))
    
  } catch (error) {
    console.error('Bulk operation failed:', error)
    await db
      .update(agencyBulkOperations)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      .where(eq(agencyBulkOperations.id, operationId))
  }
}