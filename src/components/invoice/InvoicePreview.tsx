import { type InvoiceData, calculateTotals, formatCurrency } from "../../types/invoice";

interface InvoicePreviewProps {
  invoice: InvoiceData;
  isPro?: boolean;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function InvoicePreview({ invoice, isPro = false }: InvoicePreviewProps) {
  const { subtotal, discount, tax, total } = calculateTotals(invoice);
  // Free users always get the default brand accent; custom color is Pro-only
  const accent = isPro ? invoice.accentColor || "hsl(16 95% 52%)" : "hsl(16 95% 52%)";
  const accentLight = "hsl(16 95% 97%)";

  return (
    <div
      className="w-full rounded-2xl overflow-hidden print:rounded-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.12)] min-h-[700px]"
      style={{
        fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      }}
    >
      {/* Header accent bar */}
      <div className="h-1.5 w-full" style={{ background: accent }} />

      <div className="p-10">
        {/* Top: Logo + Invoice label */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {invoice.logoUrl ? (
              <img
                src={invoice.logoUrl}
                alt="Company logo"
                className="w-14 h-14 rounded-2xl object-contain mb-3 border border-border bg-card"
                onError={(e) => {
                  // Fallback to initials if image fails
                  const el = e.currentTarget;
                  el.style.display = "none";
                  if (el.nextElementSibling) {
                    (el.nextElementSibling as HTMLElement).style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3 tracking-wider"
              style={{
                background: accent,
                display: invoice.logoUrl ? "none" : "flex",
              }}
            >
              {invoice.logoText || "YS"}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {invoice.fromName || "Your Name"}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {invoice.fromEmail || "email@example.com"}
            </p>
            {invoice.fromAddress && (
              <p className="text-xs mt-0.5 max-w-48 leading-relaxed text-muted-foreground">
                {invoice.fromAddress}
              </p>
            )}
          </div>

          <div className="text-right">
            <h1 className="text-4xl font-bold tracking-tight mb-1 text-foreground">INVOICE</h1>
            <p
              className="text-sm font-mono font-medium px-3 py-1 rounded-lg inline-block"
              style={{ background: accentLight, color: accent }}
            >
              #{invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Dates + Billed To */}
        <div className="grid grid-cols-3 gap-8 mb-10 pb-8 border-b border-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-muted-foreground">
              Billed To
            </p>
            <p className="text-sm font-bold text-foreground">{invoice.toName || "—"}</p>
            {invoice.toEmail && <p className="text-xs mt-0.5 text-foreground">{invoice.toEmail}</p>}
            {invoice.toAddress && (
              <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">
                {invoice.toAddress}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-muted-foreground">
              Issue Date
            </p>
            <p className="text-sm font-medium text-foreground">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-muted-foreground">
              Due Date
            </p>
            <p className="text-sm font-bold text-foreground">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left text-xs font-semibold uppercase tracking-widest py-3 text-muted-foreground w-1/2">
                Description
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-widest py-3 w-16 text-muted-foreground">
                Qty
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-widest py-3 w-28 text-muted-foreground">
                Rate
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-widest py-3 w-28 text-muted-foreground">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: `1px solid ${idx === invoice.lineItems.length - 1 ? "transparent" : "#f8f5f2"}`,
                }}
              >
                <td className="py-3.5 text-sm text-foreground">
                  {item.description || <span className="text-[#c8b8a8]">No description</span>}
                </td>
                <td className="py-3.5 text-sm text-center text-foreground">{item.quantity}</td>
                <td className="py-3.5 text-sm text-right font-mono text-foreground">
                  {formatCurrency(item.rate, invoice.currency)}
                </td>
                <td className="py-3.5 text-sm text-right font-mono font-medium text-foreground">
                  {formatCurrency(item.quantity * item.rate, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-foreground">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-foreground">
                <span>Discount</span>
                <span className="font-mono text-[hsl(151_55%_35%)]">
                  -{formatCurrency(discount, invoice.currency)}
                </span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm text-foreground">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono">{formatCurrency(tax, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-border">
              <span className="text-base font-bold text-foreground">Total Due</span>
              <span className="text-xl font-bold font-mono" style={{ color: accent }}>
                {formatCurrency(total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-warning/10 text-warning">
            Pending Payment
          </span>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            className="rounded-xl p-4 bg-background"
            style={{ borderLeft: `3px solid ${accent}` }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5 text-muted-foreground">
              Notes
            </p>
            <p className="text-sm leading-relaxed text-foreground">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t flex items-center justify-between border-border">
          {isPro ? (
            // Pro: minimal, unobtrusive
            <p className="text-xs text-[#d4c9be]">invoiceflow.io</p>
          ) : (
            // Free: honest watermark — it's what motivates the upgrade
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Created with{" "}
                <span className="font-semibold" style={{ color: accent }}>
                  InvoiceFlow
                </span>
              </p>
              <span className="px-1.5 py-0.5 rounded font-medium text-[10px] bg-[hsl(16_95%_96%)] text-[hsl(16_80%_40%)]">
                Free
              </span>
            </div>
          )}
          <p className="text-xs font-mono text-[#c8b8a8]">
            #{invoice.invoiceNumber} · {invoice.currency}
          </p>
        </div>
      </div>
    </div>
  );
}
