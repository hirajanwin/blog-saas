# Payment & Monetization System

This document describes the Polar payment integration, subscription management, and usage-based billing features.

## Overview

The platform uses **Polar** as the payment processor for handling subscriptions, one-time payments, and usage-based billing. Polar provides:
- Subscription management (monthly/yearly)
- One-time payments
- Customer portal
- Webhook notifications
- Tax compliance (Merchant of Record)
- Usage-based billing support

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Polar Payment Integration
POLAR_ACCESS_TOKEN=pk_live_xxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
PUBLIC_URL=https://your-domain.com
```

### 2. Create Products in Polar Dashboard

Create subscription products with these IDs:
- `pro-monthly` - Professional plan ($49/mo)
- `enterprise-monthly` - Agency plan ($199/mo)

### 3. Configure Webhooks

In Polar dashboard, add webhook endpoint:
```
https://your-domain.com/api/webhooks/polar
```

Events to enable:
- `customer.created`
- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.canceled`
- `order.created`
- `order.paid`

## Database Schema

### Tables

```sql
-- Polar customers linked to teams
polar_customers
├── id (PK)
├── polar_customer_id (unique)
├── team_id (FK → teams)
├── email
├── name
├── metadata (JSON)
└── timestamps

-- Active subscriptions
polar_subscriptions
├── id (PK)
├── polar_subscription_id (unique)
├── customer_id (FK → polar_customers)
├── polar_product_id
├── product_name
├── status (active, canceled, trialing, past_due)
├── current_period_start
├── current_period_end
├── cancel_at_period_end
├── amount (cents)
├── currency
├── metadata (JSON)
└── timestamps

-- One-time orders
polar_orders
├── id (PK)
├── polar_order_id (unique)
├── customer_id (FK → polar_customers)
├── polar_product_id
├── product_name
├── status (pending, paid, refunded)
├── amount (cents)
├── currency
├── paid_at
├── refunded_at
└── timestamps

-- Usage tracking for metered features
usage_tracking
├── id (PK)
├── team_id (FK → teams)
├── subscription_id (FK → polar_subscriptions)
├── metric (ai_credits, api_calls, storage_gb)
├── quantity
├── period (YYYY-MM)
└── recorded_at
```

## API Endpoints

### Checkout

```
GET /api/checkout?products=pro-monthly&customerEmail=user@example.com
```

Redirects to Polar checkout page.

### Webhooks

```
POST /api/webhooks/polar
```

Handles all payment events:
- Customer created → Links Polar customer to team
- Subscription active → Updates team plan
- Subscription canceled → Reverts to free plan
- Order paid → Grants one-time features

### Usage Tracking

```
GET /api/billing/usage?teamId=xxx&period=2026-02
```

Returns usage data with limits.

```
POST /api/billing/usage
{
  "teamId": "xxx",
  "metric": "ai_credits",
  "quantity": 10,
  "action": "increment"
}
```

Actions:
- `increment` - Add to usage
- `check` - Check if quota available
- `reset` - Reset period usage (admin)

## Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Blogs | 1 | 5 | Unlimited |
| Posts/mo | 10 | Unlimited | Unlimited |
| AI Credits | 1,000 | 10,000 | Unlimited |
| Custom Domains | 0 | 5 | Unlimited |
| Team Members | 3 | 10 | Unlimited |
| Storage | 1GB | 10GB | Unlimited |
| White-label | ❌ | ❌ | ✅ |
| Agency Tools | ❌ | ❌ | ✅ |

## Implementation

### Using in Components

```tsx
import PricingSection from '@/components/PricingSection'

// In your pricing page
<PricingSection 
  currentPlan={team?.planType}
  onUpgrade={(planId) => console.log('Upgrade:', planId)}
  showYearly={true}
/>
```

### Using in API

```typescript
// Check if team can use feature
const response = await fetch('/api/billing/usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    teamId: 'xxx',
    metric: 'ai_credits',
    quantity: 100,
    action: 'check'
  })
})

const { allowed, remaining } = await response.json()
if (!allowed) {
  // Show upgrade prompt
}
```

## Webhook Security

Webhooks are verified using HMAC-SHA256 signature:

```typescript
import { createHmac } from 'crypto'

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  return signature === expectedSignature
}
```

## Testing

### Sandbox Mode

Use Polar sandbox environment for testing:
- Sandbox API: `https://sandbox-api.polar.sh/v1`
- Create test products in sandbox dashboard

### Local Development

Use ngrok to receive webhooks locally:
```bash
ngrok http 3000
# Configure webhook URL in Polar to ngrok URL
```

## Revenue Share (Agencies)

Agencies can mark up pricing for clients:

```typescript
// In agency billing calculation
const clientMonthlyFee = 9900 // $99.00
const polarFee = clientMonthlyFee * 0.05 // 5%
const agencyProfit = clientMonthlyFee - polarFee

// Record in agency_billing table
{
  totalRevenue: clientMonthlyFee,
  polarFees: polarFee,
  agencyProfit,
  profitMarginPercent: 95
}
```

## Next Steps

1. Apply database migration: `npm run db:migrate`
2. Set up Polar account and products
3. Configure webhook URL in Polar
4. Add environment variables
5. Test checkout flow
6. Monitor webhook events

## Troubleshooting

### Webhooks not received
- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Check Polar dashboard for delivery logs

### Subscription not activating
- Check webhook handler logs
- Verify team ID mapping in customer record

### Usage not tracking
- Ensure `action: 'increment'` called after feature usage
- Check usage_tracking table for records
