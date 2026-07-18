import { useState } from "react";
import { Copy, Link2, CheckCircle2, DollarSign, Clock, History } from "lucide-react";
import type { GeneratedInvoice } from "../../hooks/useGeneratedInvoices";

type HistoryFilter = "all" | "pending" | "paid";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function fmtAmount(amount: number, currency: string) {
  const sym: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
    BRL: "R$",
  };
  return `${sym[currency] || "$"}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export interface HistoryTabProps {
  generatedItems: GeneratedInvoice[];
  onMarkPaid: (id: string) => void;
  onMarkPending: (id: string) => void;
  onCopyPortalLink: (invoiceId: string) => void;
  onViewPortal: (invoiceId: string) => void;
}

export function HistoryTab({
  generatedItems,
  onMarkPaid,
  onMarkPending,
  onCopyPortalLink,
  onViewPortal,
}: HistoryTabProps) {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");

  const filteredHistory =
    historyFilter === "all"
      ? generatedItems
      : generatedItems.filter((i) => i.status === historyFilter);

  return (
    <>
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4">
        {(["all", "pending", "paid"] as HistoryFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setHistoryFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
              historyFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            {f === "all"
              ? `All (${generatedItems.length})`
              : f === "paid"
                ? `Paid (${generatedItems.filter((i) => i.status === "paid").length})`
                : `Pending (${generatedItems.filter((i) => i.status === "pending").length})`}
          </button>
        ))}

        {generatedItems.length > 0 && (
          <div className="ml-auto text-xs text-muted-foreground">
            {fmtAmount(
              generatedItems.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
              "USD",
            )}{" "}
            collected
          </div>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[hsl(16_95%_96%)]">
            <History size={24} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-1 text-foreground">No invoices yet</h3>
          <p className="text-sm max-w-xs text-muted-foreground">
            Generate invoices from your schedules — they'll appear here with payment status.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-shadow hover:shadow-sm bg-card border-border"
            >
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    inv.status === "paid" ? "bg-[hsl(151_55%_93%)]" : "bg-[hsl(16_95%_96%)]"
                  }`}
                >
                  {inv.status === "paid" ? (
                    <CheckCircle2 size={16} className="text-[hsl(151_55%_35%)]" />
                  ) : (
                    <DollarSign size={16} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{inv.invoiceNumber}</p>
                    <p className="text-sm font-medium truncate text-foreground">{inv.clientName}</p>
                  </div>
                  <p className="text-xs mt-0.5 text-muted-foreground">
                    {formatDate(inv.createdAt.split("T")[0])}
                    {inv.paidAt ? ` · paid ${formatDate(inv.paidAt.split("T")[0])}` : ""}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-sm font-bold font-mono hidden sm:block text-foreground">
                  {fmtAmount(inv.amount, inv.currency)}
                </p>

                {/* Status toggle */}
                <button
                  onClick={() =>
                    inv.status === "paid" ? onMarkPending(inv.id) : onMarkPaid(inv.id)
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    inv.status === "paid"
                      ? "bg-[hsl(151_55%_93%)] text-[hsl(151_55%_28%)] border-[hsl(151_55%_80%)]"
                      : "bg-warning/10 text-warning border-[hsl(35_80%_82%)]"
                  }`}
                >
                  {inv.status === "paid" ? (
                    <>
                      <CheckCircle2 size={11} />
                      Paid
                    </>
                  ) : (
                    <>
                      <Clock size={11} />
                      Pending
                    </>
                  )}
                </button>

                {/* Portal links */}
                <button
                  onClick={() => onCopyPortalLink(inv.id)}
                  className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50 border-border text-muted-foreground"
                  title="Copy portal link"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={() => onViewPortal(inv.id)}
                  className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50 border-border text-muted-foreground"
                  title="View portal"
                >
                  <Link2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
