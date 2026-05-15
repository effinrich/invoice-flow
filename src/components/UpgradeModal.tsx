import { X, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react'
import { STRIPE_CONFIG } from '../hooks/useSubscription'
import type { User } from '@blinkdotnew/sdk'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  user: User | null
  defaultPlan?: 'pro' | 'agency'
  onLoginRequired: () => void
}

const planDetails = {
  pro: {
    name: 'Pro',
    price: '$12',
    period: '/month',
    color: 'hsl(16 95% 52%)',
    badge: 'Most Popular',
    features: [
      'Unlimited invoices',
      'PDF export (print-ready)',
      '10+ premium templates',
      'Custom logo & brand colors',
      'Payment status tracking',
      'Client management',
      'Priority email support',
    ],
  },
  agency: {
    name: 'Agency',
    price: '$29',
    period: '/month',
    color: 'hsl(16 75% 35%)',
    badge: 'For Teams',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'White-label option',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA support',
    ],
  },
}

export function UpgradeModal({
  open,
  onClose,
  user,
  defaultPlan = 'pro',
  onLoginRequired,
}: UpgradeModalProps) {
  if (!open) return null

  const handleUpgrade = (plan: 'pro' | 'agency') => {
    if (!user) {
      onLoginRequired()
      return
    }

    const config = STRIPE_CONFIG[plan]
    const successUrl = `${window.location.origin}${window.location.pathname}?upgraded=${plan}&session_id={CHECKOUT_SESSION_ID}`

    // Build Stripe Payment Link URL with pre-filled email
    const baseUrl = `https://buy.stripe.com/`
    
    // We'll use Stripe Checkout hosted page via the price ID
    // Since we're on starter tier (no backend), use Payment Links approach
    // Build a direct checkout URL
    const params = new URLSearchParams({
      prefilled_email: user.email || '',
      client_reference_id: user.id,
      success_url: successUrl,
      cancel_url: window.location.href,
    })

    // Use Stripe's hosted checkout with price parameter
    const checkoutUrl = `https://checkout.stripe.com/pay/${config.priceId}?${params.toString()}`
    
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const plan = planDetails[defaultPlan]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg, hsl(16 95% 97%), hsl(16 95% 93%))' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'hsl(16 95% 52%)', color: '#fff' }}
            >
              <Sparkles size={11} />
              {plan.badge}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors"
              style={{ color: '#9c8572' }}
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a1208' }}>
            Upgrade to {plan.name}
          </h2>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold" style={{ color: '#1a1208' }}>{plan.price}</span>
            <span className="text-sm mb-1" style={{ color: '#9c8572' }}>{plan.period}</span>
          </div>
        </div>

        {/* Features */}
        <div className="px-8 py-6">
          <p className="text-sm font-semibold mb-4" style={{ color: '#6b5c4c' }}>
            Everything you get:
          </p>
          <div className="space-y-3 mb-8">
            {plan.features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm" style={{ color: '#3d2e22' }}>
                <CheckCircle2 size={16} style={{ color: 'hsl(151 55% 35%)', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => handleUpgrade(defaultPlan)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white mb-3 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'hsl(16 95% 52%)',
              boxShadow: '0 8px 24px hsl(16 95% 52% / 0.35)',
            }}
          >
            <ExternalLink size={16} />
            {user ? `Subscribe to ${plan.name}` : 'Sign in to subscribe'}
          </button>

          {!user && (
            <p className="text-center text-xs" style={{ color: '#9c8572' }}>
              You'll be redirected to sign in first, then to checkout.
            </p>
          )}

          {user && (
            <p className="text-center text-xs" style={{ color: '#9c8572' }}>
              Opens Stripe checkout in a new tab. Use promo code{' '}
              <span
                className="font-bold px-1 rounded"
                style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 35%)' }}
              >
                VAJ4CH41
              </span>{' '}
              for 100% off your first month.
            </p>
          )}
        </div>

        {/* Switch plan */}
        {defaultPlan === 'pro' && (
          <div
            className="px-8 pb-6 pt-0 border-t flex items-center justify-center"
            style={{ borderColor: '#f0ece8' }}
          >
            <button
              onClick={() => handleUpgrade('agency')}
              className="mt-4 text-xs underline"
              style={{ color: '#9c8572' }}
            >
              View Agency plan ($29/mo) →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
