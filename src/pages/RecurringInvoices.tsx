import React, { useState } from 'react'
import {
  ArrowLeft, Plus, RefreshCw, Pause, Play, Trash2, Edit2,
  FileText, Calendar, Crown, AlertCircle, Sparkles, RotateCcw,
  Copy, CheckCircle2, CreditCard, Link2
} from 'lucide-react'
import { toast } from '@blinkdotnew/ui'
import type { User } from '@blinkdotnew/sdk'
import type { RecurringInvoice } from '../types/recurring'
import { FREQUENCY_LABELS, daysUntil, buildInvoiceFromTemplate } from '../types/recurring'
import type { InvoiceData } from '../types/invoice'
import { calculateTotals, formatCurrency } from '../types/invoice'
import { useRecurringInvoices } from '../hooks/useRecurringInvoices'
import { useGeneratedInvoices } from '../hooks/useGeneratedInvoices'
import { RecurringInvoiceModal } from '../components/recurring/RecurringInvoiceModal'

interface Props {
  onBack: () => void
  onGenerateInvoice: (data: InvoiceData) => void
  onViewPortal: (invoiceId: string) => void
  user: User | null
  isPro: boolean
  onUpgrade: (p?: 'pro' | 'agency') => void
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return dateStr }
}

function DueBadge({ nextDueDate }: { nextDueDate: string }) {
  const days = daysUntil(nextDueDate)
  if (days < 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={10} />Overdue</span>
  if (days === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)' }}>Due today</span>
  if (days <= 7) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)' }}>In {days}d</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#f0ece8', color: '#6b5c4c' }}>In {days}d</span>
}

function RecurringCard({ item, onGenerate, onEdit, onToggle, onDelete, lastInvoiceId, onCopyPortalLink, onViewPortal }: {
  item: RecurringInvoice
  onGenerate: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  lastInvoiceId?: string | null
  onCopyPortalLink?: () => void
  onViewPortal?: () => void
}) {
  const { total } = calculateTotals({ lineItems: item.lineItems, taxRate: item.taxRate, discountAmount: item.discountAmount, currency: item.currency } as Parameters<typeof calculateTotals>[0])
  const isPaused = item.status === 'paused'
  const hasPaymentLink = !!item.stripePaymentLinkUrl

  return (
    <div className="rounded-2xl border p-5 transition-shadow hover:shadow-md" style={{ background: isPaused ? '#faf9f7' : '#fff', borderColor: isPaused ? '#e8e0d8' : '#e2d8d0', opacity: isPaused ? 0.8 : 1 }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: isPaused ? '#b0a89e' : item.accentColor }}>
            {item.logoText || item.clientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base truncate" style={{ color: '#1a1208' }}>{item.clientName}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#9c8572' }}>
                <RotateCcw size={10} />{FREQUENCY_LABELS[item.frequency]}
              </span>
              {isPaused && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: '#f0ece8', color: '#9c8572' }}>Paused</span>}
              {hasPaymentLink && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: 'hsl(151 55% 93%)', color: 'hsl(151 55% 30%)' }}><CreditCard size={9} />Pay enabled</span>}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold font-mono" style={{ color: '#1a1208' }}>{formatCurrency(total, item.currency)}</p>
          <p className="text-xs" style={{ color: '#9c8572' }}>per invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: '#faf9f7' }}>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#9c8572' }}>Next Due</p>
          <p className="text-xs font-medium mb-1" style={{ color: '#1a1208' }}>{formatDate(item.nextDueDate)}</p>
          <DueBadge nextDueDate={item.nextDueDate} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#9c8572' }}>Generated</p>
          <p className="text-sm font-bold" style={{ color: '#1a1208' }}>{item.invoiceCount}</p>
          <p className="text-xs" style={{ color: '#9c8572' }}>invoices</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#9c8572' }}>Last</p>
          <p className="text-xs font-medium" style={{ color: '#1a1208' }}>{item.lastGeneratedAt ? formatDate(item.lastGeneratedAt.split('T')[0]) : '—'}</p>
        </div>
      </div>

      {lastInvoiceId && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl mb-3 border" style={{ background: 'hsl(16 95% 97%)', borderColor: 'hsl(16 60% 88%)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <Link2 size={12} style={{ color: 'hsl(16 95% 52%)', flexShrink: 0 }} />
            <span className="text-xs font-medium truncate" style={{ color: 'hsl(16 80% 35%)' }}>Client portal ready — share link to collect payment</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onCopyPortalLink} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-orange-100" style={{ color: 'hsl(16 95% 52%)' }}><Copy size={11} />Copy</button>
            <button onClick={onViewPortal} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-orange-100" style={{ color: 'hsl(16 95% 52%)' }}>View</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isPaused ? (
          <button onClick={onGenerate} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: item.accentColor, boxShadow: `0 4px 12px ${item.accentColor}55` }}>
            <RefreshCw size={14} />Generate Invoice
          </button>
        ) : (
          <button onClick={onToggle} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 35%)' }}>
            <Play size={14} />Resume
          </button>
        )}
        <button onClick={onEdit} className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-orange-50" style={{ borderColor: '#e8e0d8', color: '#6b5c4c' }}><Edit2 size={14} /></button>
        <button onClick={onToggle} className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-orange-50" style={{ borderColor: '#e8e0d8', color: '#6b5c4c' }}>{isPaused ? <Play size={14} /> : <Pause size={14} />}</button>
        <button onClick={onDelete} className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-red-50" style={{ borderColor: '#e8e0d8', color: '#9c8572' }} onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5' }} onMouseLeave={e => { e.currentTarget.style.color = '#9c8572'; e.currentTarget.style.borderColor = '#e8e0d8' }}><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

const PRO_FEATURES: Array<{ label: string; Icon: React.ElementType }> = [
  { label: 'Weekly, monthly, quarterly, annual schedules', Icon: Calendar },
  { label: 'Auto-populated invoice templates per client', Icon: FileText },
  { label: 'Due date tracking and overdue alerts', Icon: AlertCircle },
  { label: 'Shareable client portal with Stripe Pay button', Icon: CreditCard },
]

export default function RecurringInvoices({ onBack, onGenerateInvoice, onViewPortal, user, isPro, onUpgrade }: Props) {
  const { items, isLoading, create, update, remove, toggleStatus, markGenerated, isCreating, isUpdating } = useRecurringInvoices(user?.id ?? null)
  const { items: generatedItems, create: saveInvoice } = useGeneratedInvoices(user?.id ?? null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringInvoice | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const lastGeneratedMap = generatedItems.reduce<Record<string, string>>((acc, inv) => {
    if (inv.recurringInvoiceId && !acc[inv.recurringInvoiceId]) {
      acc[inv.recurringInvoiceId] = inv.id
    }
    return acc
  }, {})

  const getPortalUrl = (invoiceId: string) =>
    `${window.location.origin}${window.location.pathname}?invoice=${invoiceId}`

  const handleCreate = async (data: Parameters<typeof create>[0]) => {
    await create(data)
    toast.success('Recurring invoice created', { description: `${data.clientName} · ${FREQUENCY_LABELS[data.frequency]}` })
  }

  const handleUpdate = async (data: Parameters<typeof create>[0]) => {
    if (!editing) return
    await update({ id: editing.id, ...data })
    toast.success('Changes saved')
    setEditing(null)
  }

  const handleGenerate = async (item: RecurringInvoice) => {
    const count = item.invoiceCount + 1
    const invoiceNumber = `INV-${String(count).padStart(3, '0')}`
    const invoiceData = buildInvoiceFromTemplate(item, invoiceNumber)

    let savedId: string | null = null
    if (user) {
      try {
        savedId = await saveInvoice({
          userId: user.id,
          recurringInvoiceId: item.id,
          invoiceData,
          stripePaymentUrl: item.stripePaymentLinkUrl ?? null,
        })
      } catch { /* non-fatal */ }
    }

    await markGenerated(item)

    const portalUrl = savedId ? getPortalUrl(savedId) : null
    toast.success(`Invoice generated for ${item.clientName}`, {
      description: portalUrl ? 'Client portal created — copy link to share' : `${invoiceNumber} ready`,
      action: portalUrl ? { label: 'Copy Link', onClick: () => { navigator.clipboard.writeText(portalUrl); toast.success('Portal link copied!') } } : undefined,
    })
    onGenerateInvoice(invoiceData)
  }

  const handleCopyPortalLink = (invoiceId: string) => {
    navigator.clipboard.writeText(getPortalUrl(invoiceId)).then(() => {
      toast.success('Portal link copied!', { description: 'Send this link to your client to view and pay.' })
    })
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    setDeleteConfirm(null)
    toast.success('Recurring invoice deleted')
  }

  const showProGate = !isPro

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf9f7', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}>
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
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 4px 14px hsl(16 95% 52% / 0.35)' }}>
            <Plus size={15} /><span className="hidden sm:inline">New Schedule</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
        {showProGate && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'hsl(16 95% 96%)' }}><Crown size={28} style={{ color: 'hsl(16 95% 52%)' }} /></div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1208' }}>Recurring Invoices</h2>
            <p className="text-base max-w-sm mb-1" style={{ color: '#6b5c4c' }}>Set up automatic invoice schedules for retainer clients and ongoing contracts.</p>
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
        )}

        {!showProGate && (
          <>
            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Active Schedules', value: items.filter(i => i.status === 'active').length },
                  { label: 'Due This Week', value: items.filter(i => i.status === 'active' && daysUntil(i.nextDueDate) <= 7).length },
                  { label: 'Total Generated', value: items.reduce((s, i) => s + i.invoiceCount, 0) },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl border px-5 py-4" style={{ background: '#fff', borderColor: '#e8e0d8' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#9c8572' }}>{stat.label}</p>
                    <p className="text-2xl font-bold" style={{ color: '#1a1208' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {isLoading && <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'hsl(16 95% 52%)', borderTopColor: 'transparent' }} /></div>}

            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'hsl(16 95% 96%)' }}><RotateCcw size={24} style={{ color: 'hsl(16 95% 52%)' }} /></div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#1a1208' }}>No recurring invoices yet</h3>
                <p className="text-sm mb-6 max-w-sm" style={{ color: '#9c8572' }}>Set up a schedule, generate invoices in one click, and share a payment link with your client.</p>
                <div className="flex flex-col gap-3 mb-6 text-left max-w-xs w-full">
                  {[
                    { step: '1', text: 'Create a schedule with your client + service details' },
                    { step: '2', text: 'Add a Stripe Payment Link from your Stripe dashboard' },
                    { step: '3', text: 'Click "Generate Invoice" — a client portal is created' },
                    { step: '4', text: 'Share the portal link — client pays online via Stripe' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 95% 52%)' }}>{step}</div>
                      <p className="text-sm" style={{ color: '#3d2e22' }}>{text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setEditing(null); setModalOpen(true) }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 4px 12px hsl(16 95% 52% / 0.3)' }}>
                  <Plus size={14} />Create your first schedule
                </button>
              </div>
            )}

            {!isLoading && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <RecurringCard
                    key={item.id}
                    item={item}
                    onGenerate={() => handleGenerate(item)}
                    onEdit={() => { setEditing(item); setModalOpen(true) }}
                    onToggle={() => { toggleStatus(item).then(() => toast.success(item.status === 'active' ? 'Schedule paused' : 'Schedule resumed')) }}
                    onDelete={() => setDeleteConfirm(item.id)}
                    lastInvoiceId={lastGeneratedMap[item.id] ?? null}
                    onCopyPortalLink={() => { const lid = lastGeneratedMap[item.id]; if (lid) handleCopyPortalLink(lid) }}
                    onViewPortal={() => { const lid = lastGeneratedMap[item.id]; if (lid) onViewPortal(lid) }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {!showProGate && generatedItems.length > 0 && (
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6 pb-10">
          <div className="border-t pt-8" style={{ borderColor: '#e8e0d8' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: '#1a1208' }}>Recent Generated Invoices</h3>
              <span className="text-xs" style={{ color: '#9c8572' }}>{generatedItems.length} invoices</span>
            </div>
            <div className="space-y-2">
              {generatedItems.slice(0, 10).map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border" style={{ background: '#fff', borderColor: '#e8e0d8' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'hsl(16 95% 96%)' }}><FileText size={14} style={{ color: 'hsl(16 95% 52%)' }} /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1a1208' }}>{inv.invoiceNumber} · {inv.clientName}</p>
                      <p className="text-xs" style={{ color: '#9c8572' }}>{formatDate(inv.createdAt.split('T')[0])}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inv.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'hsl(151 55% 93%)', color: 'hsl(151 55% 28%)' }}><CheckCircle2 size={10} />Paid</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)' }}>Pending</span>
                    )}
                    <button onClick={() => handleCopyPortalLink(inv.id)} className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50" style={{ borderColor: '#e8e0d8', color: '#9c8572' }} title="Copy client portal link"><Copy size={12} /></button>
                    <button onClick={() => onViewPortal(inv.id)} className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50" style={{ borderColor: '#e8e0d8', color: '#9c8572' }} title="View client portal"><Link2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl" style={{ background: '#fff' }}>
            <h3 className="text-base font-bold mb-2" style={{ color: '#1a1208' }}>Delete recurring invoice?</h3>
            <p className="text-sm mb-5" style={{ color: '#6b5c4c' }}>This schedule will be permanently deleted. Generated invoices are not affected.</p>
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
