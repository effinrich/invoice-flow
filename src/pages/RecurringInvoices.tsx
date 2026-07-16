import React, { useState, useMemo } from 'react'
import {
  ArrowLeft, Plus, FileText, Crown, Sparkles,
  RotateCcw, Calendar, AlertCircle, CreditCard,
  Users, History, Clock, TrendingUp,
} from 'lucide-react'
import { toast } from '@blinkdotnew/ui'
import type { User } from '@blinkdotnew/sdk'
import type { RecurringInvoice } from '../types/recurring'
import { FREQUENCY_LABELS, daysUntil, buildInvoiceFromTemplate } from '../types/recurring'
import type { InvoiceData } from '../types/invoice'
import { useRecurringInvoices } from '../hooks/useRecurringInvoices'
import { useGeneratedInvoices } from '../hooks/useGeneratedInvoices'
import { RecurringInvoiceModal } from '../components/recurring/RecurringInvoiceModal'
import { SchedulesTab } from '../components/recurring/SchedulesTab'
import { ClientsTab } from '../components/recurring/ClientsTab'
import type { ClientSummary } from '../components/recurring/ClientsTab'
import { HistoryTab } from '../components/recurring/HistoryTab'

interface Props {
  onBack: () => void
  onGenerateInvoice: (data: InvoiceData) => void
  onViewPortal: (invoiceId: string) => void
  user: User | null
  isPro: boolean
  onUpgrade: (p?: 'pro' | 'agency') => void
}

type Tab = 'schedules' | 'clients' | 'history'

const PRO_FEATURES: Array<{ label: string; Icon: React.ElementType }> = [
  { label: 'Weekly, monthly, quarterly, annual schedules', Icon: Calendar },
  { label: 'Client subscription dashboard', Icon: Users },
  { label: 'Due date tracking & overdue alerts', Icon: AlertCircle },
  { label: 'Shareable client portal with Stripe Pay', Icon: CreditCard },
]

export default function RecurringInvoices({ onBack, onGenerateInvoice, onViewPortal, user, isPro, onUpgrade }: Props) {
  const { items, isLoading, create, update, remove, toggleStatus, markGenerated, isCreating, isUpdating } = useRecurringInvoices(user?.id ?? null)
  const { items: generatedItems, create: saveInvoice, markPaid, markPending } = useGeneratedInvoices(user?.id ?? null)

  const [tab, setTab] = useState<Tab>('schedules')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringInvoice | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Map recurringInvoiceId → most-recent generated invoice id
  const lastGeneratedMap = useMemo(() => (
    generatedItems.reduce<Record<string, string>>((acc, inv) => {
      if (inv.recurringInvoiceId && !acc[inv.recurringInvoiceId]) acc[inv.recurringInvoiceId] = inv.id
      return acc
    }, {})
  ), [generatedItems])

  // Aggregate per-client data for Clients tab
  const clientSummaries = useMemo((): ClientSummary[] => {
    const byClient: Record<string, ClientSummary> = {}
    items.forEach(s => {
      const key = s.clientName.toLowerCase().trim()
      if (!byClient[key]) {
        byClient[key] = {
          name: s.clientName,
          email: s.clientEmail,
          schedules: [],
          totalBilled: 0,
          paidCount: 0,
          pendingCount: 0,
          currency: s.currency,
          nextDueDate: null,
          accentColor: s.accentColor,
          logoText: s.logoText,
          logoUrl: s.logoUrl,
        }
      }
      byClient[key].schedules.push(s)
    })
    generatedItems.forEach(inv => {
      const key = inv.clientName.toLowerCase().trim()
      if (byClient[key]) {
        byClient[key].totalBilled += inv.amount
        if (inv.status === 'paid') byClient[key].paidCount++
        else byClient[key].pendingCount++
      }
    })
    Object.values(byClient).forEach(c => {
      const activeDates = c.schedules.filter(s => s.status === 'active').map(s => s.nextDueDate).sort()
      c.nextDueDate = activeDates[0] ?? null
    })
    return Object.values(byClient).sort((a, b) => a.name.localeCompare(b.name))
  }, [items, generatedItems])

  const getPortalUrl = (invoiceId: string) =>
    `${window.location.origin}${window.location.pathname}?invoice=${invoiceId}`

  const handleCreate = async (data: Parameters<typeof create>[0]) => {
    await create(data)
    toast.success('Subscription schedule created', { description: `${data.clientName} · ${FREQUENCY_LABELS[data.frequency]}` })
  }

  const handleUpdate = async (data: Parameters<typeof create>[0]) => {
    if (!editing) return
    await update({ id: editing.id, ...data })
    toast.success('Schedule updated')
    setEditing(null)
  }

  const handleGenerate = async (item: RecurringInvoice) => {
    const count = item.invoiceCount + 1
    const invoiceNumber = `INV-${String(count).padStart(3, '0')}`
    const invoiceData = buildInvoiceFromTemplate(item, invoiceNumber)
    await markGenerated(item)

    let savedId: string | null = null
    if (user) {
      try {
        savedId = await saveInvoice({ userId: user.id, recurringInvoiceId: item.id, invoiceData, stripePaymentUrl: item.stripePaymentLinkUrl ?? null })
      } catch { /* non-fatal */ }
    }

    const portalUrl = savedId ? getPortalUrl(savedId) : null
    toast.success(`Invoice generated for ${item.clientName}`, {
      description: portalUrl ? 'Client portal ready' : `${invoiceNumber} ready`,
      action: portalUrl ? { label: 'Copy Link', onClick: () => { navigator.clipboard.writeText(portalUrl); toast.success('Copied!') } } : undefined,
    })
    onGenerateInvoice(invoiceData)
  }

  const handleCopyPortalLink = (invoiceId: string) => {
    navigator.clipboard.writeText(getPortalUrl(invoiceId)).then(() => {
      toast.success('Portal link copied!', { description: 'Share with your client to view and pay.' })
    })
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    setDeleteConfirm(null)
    toast.success('Schedule deleted')
  }

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (item: RecurringInvoice) => { setEditing(item); setModalOpen(true) }
  const handleToggle = (item: RecurringInvoice) => {
    toggleStatus(item).then(() => toast.success(item.status === 'active' ? 'Schedule paused' : 'Schedule resumed'))
  }

  const showProGate = !isPro
  const totalRevenue = generatedItems.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const activeScheduleCount = items.filter(i => i.status === 'active').length
  const dueThisWeek = items.filter(i => i.status === 'active' && daysUntil(i.nextDueDate) <= 7 && daysUntil(i.nextDueDate) >= 0).length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf9f7', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b px-4 md:px-6 h-16 flex items-center justify-between gap-4" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: '#e8e0d8' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-orange-50 transition-colors" style={{ color: '#6b5c4c' }}><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(16 95% 52%)' }}><FileText size={14} className="text-white" /></div>
            <span className="font-bold text-base" style={{ color: '#1a1208' }}>Invoice<span style={{ color: 'hsl(16 95% 52%)' }}>Flow</span></span>
          </div>
          <div className="hidden md:block h-5 border-l" style={{ borderColor: '#e8e0d8' }} />
          <div className="hidden md:flex items-center gap-2">
            <RotateCcw size={14} style={{ color: '#9c8572' }} />
            <span className="text-sm" style={{ color: '#9c8572' }}>Recurring Invoices</span>
          </div>
        </div>
        {!showProGate && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 4px 14px hsl(16 95% 52% / 0.35)' }}>
            <Plus size={15} /><span className="hidden sm:inline">New Schedule</span>
          </button>
        )}
      </header>

      {/* Pro gate */}
      {showProGate && (
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'hsl(16 95% 96%)' }}><Crown size={28} style={{ color: 'hsl(16 95% 52%)' }} /></div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1208' }}>Recurring Invoices</h2>
            <p className="text-base max-w-sm mb-1" style={{ color: '#6b5c4c' }}>Automate billing for retainer clients and ongoing service agreements.</p>
            <p className="text-sm mb-8" style={{ color: '#9c8572' }}>Available on Pro and Agency plans.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left max-w-md w-full">
              {PRO_FEATURES.map(({ label, Icon }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{ borderColor: '#e8e0d8', background: '#fff' }}>
                  <Icon size={14} style={{ color: 'hsl(16 95% 52%)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: '#3d2e22' }}>{label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onUpgrade('pro')} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 4px 14px hsl(16 95% 52% / 0.35)' }}>
              <Sparkles size={14} />Upgrade to Pro — $12/mo
            </button>
          </div>
        </main>
      )}

      {/* Authenticated Pro content */}
      {!showProGate && (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-6">

          {/* KPI strip */}
          {(items.length > 0 || generatedItems.length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Active Schedules', value: activeScheduleCount, icon: RotateCcw, color: 'hsl(16 95% 52%)' },
                { label: 'Due This Week', value: dueThisWeek, icon: Clock, color: dueThisWeek > 0 ? 'hsl(35 75% 40%)' : '#9c8572' },
                { label: 'Total Clients', value: clientSummaries.length, icon: Users, color: '#4F46E5' },
                { label: 'Revenue Collected', value: `$${Math.round(totalRevenue).toLocaleString()}`, icon: TrendingUp, color: 'hsl(151 55% 35%)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border px-4 py-3 flex items-center gap-3" style={{ background: '#fff', borderColor: '#e8e0d8' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#9c8572' }}>{label}</p>
                    <p className="text-base font-bold leading-tight" style={{ color: '#1a1208' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab bar */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl border" style={{ background: '#f0ece8', borderColor: '#e8e0d8', width: 'fit-content' }}>
            {([
              { id: 'schedules', label: 'Schedules', icon: RotateCcw, count: items.length },
              { id: 'clients', label: 'Clients', icon: Users, count: clientSummaries.length },
              { id: 'history', label: 'History', icon: History, count: generatedItems.length },
            ] as { id: Tab; label: string; icon: React.ElementType; count: number }[]).map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === id ? '#fff' : 'transparent',
                  color: tab === id ? '#1a1208' : '#9c8572',
                  boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <Icon size={13} />{label}
                {count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: tab === id ? 'hsl(16 95% 96%)' : '#e8e0d8', color: tab === id ? 'hsl(16 95% 52%)' : '#9c8572', fontSize: '10px' }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'hsl(16 95% 52%)', borderTopColor: 'transparent' }} />
            </div>
          )}

          {/* Tab panels */}
          {!isLoading && tab === 'schedules' && (
            <SchedulesTab
              items={items}
              lastGeneratedMap={lastGeneratedMap}
              onGenerate={handleGenerate}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={id => setDeleteConfirm(id)}
              onCopyPortalLink={handleCopyPortalLink}
              onViewPortal={onViewPortal}
              onNew={openNew}
            />
          )}

          {!isLoading && tab === 'clients' && (
            <ClientsTab
              clientSummaries={clientSummaries}
              onGenerate={handleGenerate}
              onEdit={openEdit}
              onNew={() => { openNew(); setTab('schedules') }}
            />
          )}

          {!isLoading && tab === 'history' && (
            <HistoryTab
              generatedItems={generatedItems}
              onMarkPaid={id => markPaid(id).then(() => toast.success('Marked as paid'))}
              onMarkPending={id => markPending(id).then(() => toast.success('Marked as pending'))}
              onCopyPortalLink={handleCopyPortalLink}
              onViewPortal={onViewPortal}
            />
          )}
        </div>
      )}

      {/* Modal */}
      {user && (
        <RecurringInvoiceModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSave={editing ? handleUpdate : handleCreate}
          initial={editing}
          userId={user.id}
          isSaving={isCreating || isUpdating}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl" style={{ background: '#fff' }}>
            <h3 className="text-base font-bold mb-2" style={{ color: '#1a1208' }}>Delete this schedule?</h3>
            <p className="text-sm mb-5" style={{ color: '#6b5c4c' }}>The schedule will be removed. Previously generated invoices are not affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50" style={{ borderColor: '#e8e0d8', color: '#6b5c4c' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
