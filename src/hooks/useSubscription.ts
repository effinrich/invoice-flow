import { useEffect, useState, useCallback } from 'react'
import { blink } from '../blink/client'

export type Plan = 'free' | 'pro' | 'agency'

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  plan: Plan
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionState {
  subscription: Subscription | null
  plan: Plan
  isLoading: boolean
  isPro: boolean
  isAgency: boolean
  refetch: () => Promise<void>
}

export function useSubscription(userId: string | null): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null)
      setIsLoading(false)
      return
    }
    try {
      const subs = await blink.db.subscriptions.list({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        limit: 1,
      }) as Subscription[]
      setSubscription(subs[0] ?? null)
    } catch {
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    setIsLoading(true)
    fetchSubscription()
  }, [fetchSubscription])

  const plan: Plan = subscription?.plan as Plan ?? 'free'
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

  return {
    subscription,
    plan: isActive ? plan : 'free',
    isLoading,
    isPro: isActive && (plan === 'pro' || plan === 'agency'),
    isAgency: isActive && plan === 'agency',
    refetch: fetchSubscription,
  }
}

// Stripe price IDs and checkout URLs
export const STRIPE_CONFIG = {
  pro: {
    priceId: 'price_1TXGcZ9TUspFE5VHBffUP6kr',
    productId: 'prod_UWJExLz8eN79RS',
    amount: 12,
  },
  agency: {
    priceId: 'price_1TXGcg9TUspFE5VH5VATjm7K',
    productId: 'prod_UWJEzfyTrzVQZU',
    amount: 29,
  },
}

export async function createCheckoutUrl(
  plan: 'pro' | 'agency',
  userEmail: string,
  userId: string,
  successUrl: string
): Promise<string> {
  const config = STRIPE_CONFIG[plan]
  const params = new URLSearchParams({
    price: config.priceId,
    prefilled_email: userEmail,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: window.location.href,
    allow_promotion_codes: 'true',
  })
  return `https://buy.stripe.com/checkout?${params.toString()}`
}

// Record a subscription locally after Stripe redirects back
export async function recordSubscription(
  userId: string,
  plan: Plan,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  const now = new Date().toISOString()

  // Check if subscription record exists
  const existing = await blink.db.subscriptions.list({
    where: { userId },
    limit: 1,
  })

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  if (existing.length > 0) {
    await blink.db.subscriptions.update(existing[0].id, {
      plan,
      status: 'active',
      stripeCustomerId: stripeCustomerId ?? existing[0].stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? existing[0].stripeSubscriptionId,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    })
  } else {
    await blink.db.subscriptions.create({
      userId,
      plan,
      status: 'active',
      stripeCustomerId: stripeCustomerId ?? null,
      stripeSubscriptionId: stripeSubscriptionId ?? null,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    })
  }
}
