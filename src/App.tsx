import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import InvoiceCreator from './pages/InvoiceCreator'
import RecurringInvoices from './pages/RecurringInvoices'
import ClientPortal from './pages/ClientPortal'
import { useAuth } from './hooks/useAuth'
import { useSubscription, recordSubscription } from './hooks/useSubscription'
import { blink } from './blink/client'
import { UpgradeModal } from './components/UpgradeModal'
import { toast } from '@blinkdotnew/ui'
import type { InvoiceData } from './types/invoice'

type Page = 'landing' | 'create' | 'recurring' | 'portal'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState<'pro' | 'agency'>('pro')
  const [seedInvoice, setSeedInvoice] = useState<InvoiceData | null>(null)
  const [portalInvoiceId, setPortalInvoiceId] = useState<string | null>(null)

  const { user, isLoading: authLoading } = useAuth()
  const { plan, isPro, isAgency, isLoading: subLoading, refetch } = useSubscription(user?.id ?? null)

  // Handle URL params on mount — client portal has priority
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // ?invoice=xxx → open client portal (public, no auth needed)
    const invoiceId = params.get('invoice')
    if (invoiceId) {
      setPortalInvoiceId(invoiceId)
      setPage('portal')
      return
    }

    // ?upgraded=pro → record subscription after Stripe redirect
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

    // ?upgrade=1 → open upgrade modal after login redirect
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

  const handleGenerateFromRecurring = (invoiceData: InvoiceData) => {
    setSeedInvoice(invoiceData)
    setPage('create')
  }

  const handleViewPortal = (invoiceId: string) => {
    // Update URL so the link is shareable / bookmarkable
    window.history.pushState({}, '', `?invoice=${invoiceId}`)
    setPortalInvoiceId(invoiceId)
    setPage('portal')
  }

  const handleLeavePortal = () => {
    window.history.replaceState({}, '', window.location.pathname)
    setPortalInvoiceId(null)
    setPage('landing')
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

  // Client portal — fully public, no auth required
  if (page === 'portal' && portalInvoiceId) {
    return <ClientPortal invoiceId={portalInvoiceId} onBack={handleLeavePortal} />
  }

  return (
    <>
      {page === 'create' ? (
        <InvoiceCreator
          onBack={() => { setSeedInvoice(null); setPage('landing') }}
          user={user}
          isPro={isPro}
          isAgency={isAgency}
          plan={plan}
          onUpgrade={handleOpenUpgrade}
          subLoading={subLoading}
          seedInvoice={seedInvoice}
        />
      ) : page === 'recurring' ? (
        <RecurringInvoices
          onBack={() => setPage('landing')}
          onGenerateInvoice={handleGenerateFromRecurring}
          onViewPortal={handleViewPortal}
          user={user}
          isPro={isPro}
          onUpgrade={handleOpenUpgrade}
        />
      ) : (
        <LandingPage
          onGetStarted={() => setPage('create')}
          onGoToRecurring={() => setPage('recurring')}
          user={user}
          isPro={isPro}
          plan={plan}
          onUpgrade={handleOpenUpgrade}
          onLogin={() => blink.auth.login(window.location.href)}
          onLogout={() => blink.auth.logout()}
        />
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        user={user}
        defaultPlan={upgradePlan}
        onLoginRequired={handleLoginRequired}
      />
    </>
  )
}
