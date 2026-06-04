import { type InvoiceData, calculateTotals, formatCurrency } from '../../types/invoice'

interface InvoicePreviewProps {
  invoice: InvoiceData
  isPro?: boolean
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function InvoicePreview({ invoice, isPro = false }: InvoicePreviewProps) {
  const { subtotal, discount, tax, total } = calculateTotals(invoice)
  // Free users always get the default brand accent; custom color is Pro-only
  const accent = isPro ? (invoice.accentColor || 'hsl(16 95% 52%)') : 'hsl(16 95% 52%)'
  const accentLight = 'hsl(16 95% 97%)'

  return (
    <div
      className="w-full rounded-2xl overflow-hidden print:rounded-none"
      style={{
        background: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        minHeight: 700,
        fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      }}
    >
      {/* Header accent bar */}
      <div className="h-1.5 w-full" style={{ background: accent }} />

      <div className="p-10">
        {/* Top: Logo + Invoice label */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3"
              style={{ background: accent, letterSpacing: '0.05em' }}
            >
              {invoice.logoText || 'YS'}
            </div>
            <p className="text-sm font-semibold" style={{ color: '#1a1208' }}>{invoice.fromName || 'Your Name'}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9c8572' }}>{invoice.fromEmail || 'email@example.com'}</p>
            {invoice.fromAddress && (
              <p className="text-xs mt-0.5 max-w-48 leading-relaxed" style={{ color: '#9c8572' }}>{invoice.fromAddress}</p>
            )}
          </div>

          <div className="text-right">
            <h1 className="text-4xl font-bold tracking-tight mb-1" style={{ color: '#1a1208' }}>INVOICE</h1>
            <p className="text-sm font-mono font-medium px-3 py-1 rounded-lg inline-block" style={{ background: accentLight, color: accent }}>
              #{invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Dates + Billed To */}
        <div className="grid grid-cols-3 gap-8 mb-10 pb-8 border-b" style={{ borderColor: '#f0ece8' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9c8572' }}>Billed To</p>
            <p className="text-sm font-bold" style={{ color: '#1a1208' }}>{invoice.toName || '—'}</p>
            {invoice.toEmail && <p className="text-xs mt-0.5" style={{ color: '#6b5c4c' }}>{invoice.toEmail}</p>}
            {invoice.toAddress && (
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9c8572' }}>{invoice.toAddress}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9c8572' }}>Issue Date</p>
            <p className="text-sm font-medium" style={{ color: '#1a1208' }}>{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#9c8572' }}>Due Date</p>
            <p className="text-sm font-bold" style={{ color: '#1a1208' }}>{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr style={{ borderBottom: '2px solid #f0ece8' }}>
              <th className="text-left text-xs font-semibold uppercase tracking-widest py-3" style={{ color: '#9c8572', width: '50%' }}>
                Description
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-widest py-3 w-16" style={{ color: '#9c8572' }}>Qty</th>
              <th className="text-right text-xs font-semibold uppercase tracking-widest py-3 w-28" style={{ color: '#9c8572' }}>Rate</th>
              <th className="text-right text-xs font-semibold uppercase tracking-widest py-3 w-28" style={{ color: '#9c8572' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr
                key={item.id}
                style={{ borderBottom: `1px solid ${idx === invoice.lineItems.length - 1 ? 'transparent' : '#f8f5f2'}` }}
              >
                <td className="py-3.5 text-sm" style={{ color: '#1a1208' }}>
                  {item.description || <span style={{ color: '#c8b8a8' }}>No description</span>}
                </td>
                <td className="py-3.5 text-sm text-center" style={{ color: '#6b5c4c' }}>{item.quantity}</td>
                <td className="py-3.5 text-sm text-right font-mono" style={{ color: '#6b5c4c' }}>
                  {formatCurrency(item.rate, invoice.currency)}
                </td>
                <td className="py-3.5 text-sm text-right font-mono font-medium" style={{ color: '#1a1208' }}>
                  {formatCurrency(item.quantity * item.rate, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm" style={{ color: '#6b5c4c' }}>
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#6b5c4c' }}>
                <span>Discount</span>
                <span className="font-mono" style={{ color: 'hsl(151 55% 35%)' }}>
                  -{formatCurrency(discount, invoice.currency)}
                </span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#6b5c4c' }}>
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono">{formatCurrency(tax, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-1 border-t" style={{ borderColor: '#e8e0d8' }}>
              <span className="text-base font-bold" style={{ color: '#1a1208' }}>Total Due</span>
              <span className="text-xl font-bold font-mono" style={{ color: accent }}>
                {formatCurrency(total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-8">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)' }}
          >
            Pending Payment
          </span>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="rounded-xl p-4" style={{ background: '#faf9f7', borderLeft: `3px solid ${accent}` }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#9c8572' }}>Notes</p>
            <p className="text-sm leading-relaxed" style={{ color: '#6b5c4c' }}>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t flex items-center justify-between" style={{ borderColor: '#f0ece8' }}>
          {isPro ? (
            // Pro: minimal, unobtrusive
            <p className="text-xs" style={{ color: '#d4c9be' }}>invoiceflow.io</p>
          ) : (
            // Free: honest watermark — it's what motivates the upgrade
            <div className="flex items-center gap-2">
              <p className="text-xs" style={{ color: '#9c8572' }}>
                Created with{' '}
                <span className="font-semibold" style={{ color: accent }}>InvoiceFlow</span>
              </p>
              <span
                className="px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 40%)', fontSize: '10px' }}
              >
                Free
              </span>
            </div>
          )}
          <p className="text-xs font-mono" style={{ color: '#c8b8a8' }}>
            #{invoice.invoiceNumber} · {invoice.currency}
          </p>
        </div>
      </div>
    </div>
  )
}
