import { json } from '@tanstack/react-start'
import { createDb } from '../../lib/db'
import { 
  polarCustomers, 
  polarSubscriptions, 
  polarOrders, 
  teams, 
  usageTracking,
  type NewPolarCustomer,
  type NewPolarSubscription,
  type NewPolarOrder
} from '../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { createHmac } from 'crypto'

// Simple webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  return signature === expectedSignature
}

export async function POST({ request, env }: { request: Request; env: any }) {
  try {
    const body = await request.text()
    const signature = request.headers.get('polar-signature') || request.headers.get('x-polar-signature')
    
    if (!signature) {
      return json(
        { error: 'Missing signature header' },
        { status: 401 }
      )
    }

    const webhookSecret = env.POLAR_WEBHOOK_SECRET || process.env.POLAR_WEBHOOK_SECRET
    if (!webhookSecret) {
      return json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    const db = createDb(env)

    console.log('Received webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(db, event.data)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(db, event.data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(db, event.data)
        break

      case 'subscription.active':
        await handleSubscriptionActive(db, event.data)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(db, event.data)
        break

      case 'order.created':
        await handleOrderCreated(db, event.data)
        break

      case 'order.paid':
        await handleOrderPaid(db, event.data)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCustomerCreated(db: any, customer: any) {
  // Find team by customer email or metadata
  const team = await db
    .select()
    .from(teams)
    .limit(1) // You'll need to add email field to teams or use metadata

  if (team.length > 0) {
    const newCustomer: NewPolarCustomer = {
      id: nanoid(),
      polarCustomerId: customer.id,
      teamId: team[0].id,
      email: customer.email,
      name: customer.name,
      metadata: JSON.stringify(customer.metadata || {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.insert(polarCustomers).values(newCustomer)
  }
}

async function handleSubscriptionCreated(db: any, subscription: any) {
  // Find existing customer
  const customer = await db
    .select()
    .from(polarCustomers)
    .where(eq(polarCustomers.polarCustomerId, subscription.customer_id))
    .limit(1)

  if (customer.length === 0) {
    console.error('Customer not found for subscription:', subscription.id)
    return
  }

  const newSubscription: NewPolarSubscription = {
    id: nanoid(),
    polarSubscriptionId: subscription.id,
    customerId: customer[0].id,
    polarProductId: subscription.product_id,
    productName: subscription.product?.name || 'Unknown Product',
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    amount: subscription.amount,
    currency: subscription.currency || 'usd',
    metadata: JSON.stringify(subscription.metadata || {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.insert(polarSubscriptions).values(newSubscription)

  // Update team plan
  await db
    .update(teams)
    .set({ 
      planType: subscription.product?.name?.toLowerCase().includes('pro') ? 'pro' : 
               subscription.product?.name?.toLowerCase().includes('enterprise') ? 'enterprise' : 'free'
    })
    .where(eq(teams.id, customer[0].teamId))
}

async function handleSubscriptionUpdated(db: any, subscription: any) {
  const existing = await db
    .select()
    .from(polarSubscriptions)
    .where(eq(polarSubscriptions.polarSubscriptionId, subscription.id))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(polarSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(polarSubscriptions.polarSubscriptionId, subscription.id))
  }
}

async function handleSubscriptionActive(db: any, subscription: any) {
  await handleSubscriptionUpdated(db, subscription)
}

async function handleSubscriptionCanceled(db: any, subscription: any) {
  const existing = await db
    .select()
    .from(polarSubscriptions)
    .where(eq(polarSubscriptions.polarSubscriptionId, subscription.id))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(polarSubscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(polarSubscriptions.polarSubscriptionId, subscription.id))

    // Reset team to free plan
    const customer = await db
      .select()
      .from(polarCustomers)
      .where(eq(polarCustomers.id, existing[0].customerId))
      .limit(1)

    if (customer.length > 0) {
      await db
        .update(teams)
        .set({ planType: 'free' })
        .where(eq(teams.id, customer[0].teamId))
    }
  }
}

async function handleOrderCreated(db: any, order: any) {
  // Similar to subscription created
  const customer = await db
    .select()
    .from(polarCustomers)
    .where(eq(polarCustomers.polarCustomerId, order.customer_id))
    .limit(1)

  if (customer.length > 0) {
    const newOrder: NewPolarOrder = {
      id: nanoid(),
      polarOrderId: order.id,
      customerId: customer[0].id,
      polarProductId: order.product_id,
      productName: order.product?.name || 'Unknown Product',
      status: order.status,
      amount: order.amount,
      currency: order.currency || 'usd',
      metadata: JSON.stringify(order.metadata || {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.insert(polarOrders).values(newOrder)
  }
}

async function handleOrderPaid(db: any, order: any) {
  await handleOrderCreated(db, { ...order, status: 'paid' })
}