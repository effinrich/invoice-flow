import { useState, useEffect, createContext, useContext } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useSubscription, recordSubscription } from '../hooks/useSubscription'
import { blink } from '../blink/client'
import { UpgradeModal } from '../components/UpgradeModal'
import { toast } from '@blinkdotnew/ui'
import type { Plan } from '../hooks/useSubscription'

// Context that child routes receive
export interface AppContext {
  user: ReturnType<typeof useAuth>['user']
  isPro: boolean
  isAgency: boolean
  plan: Plan
  subLoading: boolean
  onUpgrade: (p?: 'pro' | 'agency') => void
  onLogin: () => void
  onLogout: () => void
}

const AppContextInstance = createContext<AppContext | null>(null)

export function useAppContext(): AppContext {
  const ctx = useContext(AppContextInstance)
  if (!ctx) throw new Error('useAppContext must be used within RootLayout')
  return ctx
}

export function RootLayout() {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState<'pro' | 'agency'>('pro')

  const { user, isLoading: authLoading } = useAuth()
  const { plan, isPro, isAgency, isLoading: subLoading, refetch } = useSubscription(user?.id ?? null)

  // Handle post-Stripe-checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const upgraded = params.get('upgraded') as 'pro' | 'agency' | null

    if (upgraded && user && (upgraded === 'pro' || upgraded === 'agency')) {
      const handle = async () => {
        try {
          await recordSubscription(user.id, upgraded)
          await refetch()
          toast.success(`Welcome to ${upgraded === 'pro' ? 'Pro' : 'Agency'}! 🎉`, {
            description: 'Your subscription is now active. Enjoy all premium features.',
          })
          window.history.replaceState({}, '', window.location.pathname)
        } catch {
          toast.error('Could not confirm subscription. Please contact support.')
        }
      }
      handle()
    }

    if (params.get('upgrade') === '1' && user) {
      setUpgradePlan('pro')
      setUpgradeOpen(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [user, refetch])

  const handleOpenUpgrade = (p: 'pro' | 'agency' = 'pro') => {
    setUpgradePlan(p)
    setUpgradeOpen(true)
  }

  const handleLoginRequired = () => {
    blink.auth.login(window.location.href + '?upgrade=1')
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#faf9f7' }}>
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
          style={{ borderColor: 'hsl(16 95% 52%)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  const context: AppContext = {
    user,
    isPro,
    isAgency,
    plan,
    subLoading,
    onUpgrade: handleOpenUpgrade,
    onLogin: () => blink.auth.login(window.location.href),
    onLogout: () => blink.auth.logout(),
  }

  return (
    <AppContextInstance.Provider value={context}>
      <Outlet />
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        user={user}
        defaultPlan={upgradePlan}
        onLoginRequired={handleLoginRequired}
      />
    </AppContextInstance.Provider>
  )
}
