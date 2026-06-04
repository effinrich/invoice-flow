import { useState } from 'react'
import { Copy, Link2, CheckCircle2, DollarSign, Clock, History } from 'lucide-react'
import type { GeneratedInvoice } from '../../hooks/useGeneratedInvoices'

type HistoryFilter = 'all' | 'pending' | 'paid'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

function fmtAmount(amount: number, currency: string) {
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$', JPY: '¥', INR: '₹', BRL: 'R$' }
  return `${sym[currency] || '$'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export interface HistoryTabProps {
  generatedItems: GeneratedInvoice[]
  onMarkPaid: (id: string) => void
  onMarkPending: (id: string) => void
  onCopyPortalLink: (invoiceId: string) => void
  onViewPortal: (invoiceId: string) => void
}

export function HistoryTab({ generatedItems, onMarkPaid, onMarkPending, onCopyPortalLink, onViewPortal }: HistoryTabProps) {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all')

  const filteredHistory = historyFilter === 'all'
    ? generatedItems
    : generatedItems.filter(i => i.status === historyFilter)

  return (
    <>
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'pending', 'paid'] as HistoryFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setHistoryFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border"
            style={{
              background: historyFilter === f ? 'hsl(16 95% 52%)' : '#fff',
              color: historyFilter === f ? '#fff' : '#9c8572',
              borderColor: historyFilter === f ? 'hsl(16 95% 52%)' : '#e8e0d8',
            }}
          >
            {f === 'all'
              ? `All (${generatedItems.length})`
              : f === 'paid'
                ? `Paid (${generatedItems.filter(i => i.status === 'paid').length})`
                : `Pending (${generatedItems.filter(i => i.status === 'pending').length})`}
          </button>
        ))}

        {generatedItems.length > 0 && (
          <div className="ml-auto text-xs" style={{ color: '#9c8572' }}>
            {fmtAmount(generatedItems.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), 'USD')} collected
          </div>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'hsl(16 95% 96%)' }}><History size={24} style={{ color: 'hsl(16 95% 52%)' }} /></div>
          <h3 className="text-lg font-bold mb-1" style={{ color: '#1a1208' }}>No invoices yet</h3>
          <p className="text-sm max-w-xs" style={{ color: '#9c8572' }}>Generate invoices from your schedules — they'll appear here with payment status.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map(inv => (
            <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-shadow hover:shadow-sm" style={{ background: '#fff', borderColor: '#e8e0d8' }}>
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: inv.status === 'paid' ? 'hsl(151 55% 93%)' : 'hsl(16 95% 96%)' }}>
                  {inv.status === 'paid'
                    ? <CheckCircle2 size={16} style={{ color: 'hsl(151 55% 35%)' }} />
                    : <DollarSign size={16} style={{ color: 'hsl(16 95% 52%)' }} />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: '#1a1208' }}>{inv.invoiceNumber}</p>
                    <p className="text-sm font-medium truncate" style={{ color: '#6b5c4c' }}>{inv.clientName}</p>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#9c8572' }}>
                    {formatDate(inv.createdAt.split('T')[0])}{inv.paidAt ? ` · paid ${formatDate(inv.paidAt.split('T')[0])}` : ''}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-sm font-bold font-mono hidden sm:block" style={{ color: '#1a1208' }}>{fmtAmount(inv.amount, inv.currency)}</p>

                {/* Status toggle */}
                <button
                  onClick={() => inv.status === 'paid' ? onMarkPending(inv.id) : onMarkPaid(inv.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all"
                  style={inv.status === 'paid'
                    ? { background: 'hsl(151 55% 93%)', color: 'hsl(151 55% 28%)', borderColor: 'hsl(151 55% 80%)' }
                    : { background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)', borderColor: 'hsl(35 80% 82%)' }
                  }
                >
                  {inv.status === 'paid' ? <><CheckCircle2 size={11} />Paid</> : <><Clock size={11} />Pending</>}
                </button>

                {/* Portal links */}
                <button onClick={() => onCopyPortalLink(inv.id)} className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50" style={{ borderColor: '#e8e0d8', color: '#9c8572' }} title="Copy portal link"><Copy size={12} /></button>
                <button onClick={() => onViewPortal(inv.id)} className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50" style={{ borderColor: '#e8e0d8', color: '#9c8572' }} title="View portal"><Link2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
