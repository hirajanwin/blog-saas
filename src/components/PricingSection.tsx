import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/Card'
import { Check, X, Star, Zap, Shield } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice?: number
  description: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  icon: React.ReactNode
  polarProductId?: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    description: 'Perfect for individuals and small projects',
    features: [
      '1 Blog',
      '10 Posts per month',
      'Basic SEO tools',
      '1,000 AI credits monthly',
      'Community support',
      'Standard themes'
    ],
    limitations: [
      'No custom domain',
      'Basic analytics',
      'No white-label options'
    ],
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49,
    yearlyPrice: 490,
    description: 'For professional bloggers and growing businesses',
    features: [
      '5 Blogs',
      'Unlimited Posts',
      'Advanced SEO suite',
      '10,000 AI credits monthly',
      'Priority support',
      'Custom domains',
      'Advanced analytics',
      'Content automation',
      'Team collaboration (5 users)'
    ],
    popular: true,
    icon: <Zap className="w-6 h-6" />,
    polarProductId: 'pro-monthly'
  },
  {
    id: 'enterprise',
    name: 'Agency',
    price: 199,
    yearlyPrice: 1990,
    description: 'For agencies and large organizations',
    features: [
      'Unlimited Blogs',
      'Unlimited Posts',
      'Full SEO automation',
      'Unlimited AI credits',
      'Dedicated support',
      'White-label options',
      'Custom branding',
      'Advanced agency tools',
      'Bulk operations',
      'Client management',
      'Revenue sharing program'
    ],
    icon: <Shield className="w-6 h-6" />,
    polarProductId: 'enterprise-monthly'
  }
]

interface PricingSectionProps {
  currentPlan?: string
  onUpgrade?: (planId: string) => void
  showYearly?: boolean
}

export default function PricingSection({ currentPlan, onUpgrade, showYearly = false }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    showYearly ? 'yearly' : 'monthly'
  )

  const handleUpgrade = (planId: string, productId?: string) => {
    if (planId === 'free' || !productId) {
      onUpgrade?.(planId)
      return
    }

    // Redirect to Polar checkout
    const checkoutUrl = `/api/checkout?products=${productId}&success_url=${encodeURIComponent(window.location.origin + '/team/settings?billing=success')}`
    window.location.href = checkoutUrl
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Scale your content creation with powerful features
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center rounded-lg border p-1 bg-muted">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = billingCycle === 'yearly' && plan.yearlyPrice 
            ? plan.yearlyPrice / 12 
            : plan.price
          
          const isCurrentPlan = currentPlan === plan.id
          const isUpgrade = currentPlan && 
            ['free', 'pro', 'enterprise'].indexOf(plan.id) > 
            ['free', 'pro', 'enterprise'].indexOf(currentPlan)

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-2 border-primary shadow-lg scale-105' : ''} ${
                isCurrentPlan ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /month
                  </span>
                  {billingCycle === 'yearly' && plan.yearlyPrice && (
                    <div className="text-sm text-green-600 font-medium">
                      Billed annually (${plan.yearlyPrice})
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations && plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-3 border-t">
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <X className="w-4 h-4 text-red-400 mr-3 flex-shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "secondary"}
                  onClick={() => handleUpgrade(plan.id, plan.polarProductId)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : isUpgrade ? 'Upgrade Now' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Agency Information */}
      <div className="mt-16 text-center">
        <div className="bg-muted rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Agency & White-Label Solutions</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Perfect for digital agencies, marketing firms, and enterprises that want to offer 
            blog management services to their clients under their own brand.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">White-Label Platform</h3>
              <p className="text-sm text-muted-foreground">
                Remove our branding and add your own logo, colors, and domain
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Client Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage multiple client accounts from a single dashboard
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Revenue Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Built-in billing and profit sharing with detailed analytics
              </p>
            </div>
          </div>
          
          <Button 
            className="mt-6" 
            onClick={() => handleUpgrade('enterprise', 'enterprise-monthly')}
          >
            Start Agency Program
          </Button>
        </div>
      </div>
    </div>
  )
}