import { useState } from "react";
import { RefreshCw, Edit2, CheckCircle2, Users, Plus } from "lucide-react";
import type { RecurringInvoice } from "../../types/recurring";
import { FREQUENCY_LABELS } from "../../types/recurring";
import { calculateTotals, formatCurrency } from "../../types/invoice";
import { DueBadge } from "./DueBadge";

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

export interface ClientSummary {
  name: string;
  email: string;
  schedules: RecurringInvoice[];
  totalBilled: number;
  paidCount: number;
  pendingCount: number;
  currency: string;
  nextDueDate: string | null;
  accentColor: string;
  logoText: string;
  logoUrl: string | null;
}

export interface ClientsTabProps {
  clientSummaries: ClientSummary[];
  onGenerate: (item: RecurringInvoice) => void;
  onEdit: (item: RecurringInvoice) => void;
  onNew: () => void;
}

function ClientCard({
  client,
  onGenerate,
  onEdit,
}: {
  client: ClientSummary;
  onGenerate: (s: RecurringInvoice) => void;
  onEdit: (s: RecurringInvoice) => void;
}) {
  const activeSchedules = client.schedules.filter((s) => s.status === "active");
  const pausedSchedules = client.schedules.filter((s) => s.status === "paused");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border overflow-hidden bg-card border-[#e2d8d0]">
      {/* Client header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          {client.logoUrl ? (
            <img
              src={client.logoUrl}
              alt=""
              className="w-12 h-12 rounded-xl object-contain border shrink-0 border-border bg-card"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: client.accentColor }}
            >
              {client.logoText}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-base text-foreground">{client.name}</p>
            {client.email && (
              <p className="text-xs mt-0.5 truncate text-muted-foreground">{client.email}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {activeSchedules.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[hsl(151_55%_93%)] text-[hsl(151_55%_28%)]">
                  <CheckCircle2 size={9} />
                  {activeSchedules.length} active
                </span>
              )}
              {pausedSchedules.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {pausedSchedules.length} paused
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            Total Billed
          </p>
          <p className="text-xl font-bold font-mono mt-0.5 text-foreground">
            {fmtAmount(client.totalBilled, client.currency)}
          </p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {client.paidCount} paid · {client.pendingCount} pending
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-0 border-t border-b mx-5 mb-4 rounded-xl overflow-hidden border-border">
        <div className="px-3 py-2.5 text-center border-r border-border">
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5 text-muted-foreground">
            Schedules
          </p>
          <p className="text-lg font-bold text-foreground">{client.schedules.length}</p>
        </div>
        <div className="px-3 py-2.5 text-center border-r border-border">
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5 text-muted-foreground">
            Invoices
          </p>
          <p className="text-lg font-bold text-foreground">
            {client.schedules.reduce((s, r) => s + r.invoiceCount, 0)}
          </p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5 text-muted-foreground">
            Next Due
          </p>
          {client.nextDueDate ? (
            <DueBadge nextDueDate={client.nextDueDate} />
          ) : (
            <p className="text-xs font-medium text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Schedules list (collapsible) */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-between w-full text-xs font-semibold mb-2 transition-opacity hover:opacity-70 text-muted-foreground"
        >
          <span>Subscriptions ({client.schedules.length})</span>
          <span>{expanded ? "▲" : "▼"}</span>
        </button>

        {expanded && (
          <div className="space-y-2">
            {client.schedules.map((s) => {
              const { total } = calculateTotals({
                lineItems: s.lineItems,
                taxRate: s.taxRate,
                discountAmount: s.discountAmount,
                currency: s.currency,
              } as Parameters<typeof calculateTotals>[0]);
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border ${
                    s.status === "paused" ? "bg-background" : "bg-[hsl(16_95%_98%)]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {FREQUENCY_LABELS[s.frequency]}
                      </span>
                      {s.status === "paused" && (
                        <span className="text-xs text-muted-foreground">(paused)</span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      {s.lineItems
                        .slice(0, 2)
                        .map((li) => li.description)
                        .filter(Boolean)
                        .join(", ") || "Services"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold font-mono text-foreground">
                      {formatCurrency(total, s.currency)}
                    </span>
                    {s.status === "active" && (
                      <button
                        onClick={() => onGenerate(s)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: s.accentColor }}
                      >
                        <RefreshCw size={11} />
                        Generate
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(s)}
                      className="p-1.5 rounded-lg border transition-colors hover:bg-orange-50 border-border text-foreground"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ClientsTab({ clientSummaries, onGenerate, onEdit, onNew }: ClientsTabProps) {
  if (clientSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[hsl(16_95%_96%)]">
          <Users size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-1 text-foreground">No clients yet</h3>
        <p className="text-sm mb-6 max-w-xs text-muted-foreground">
          Create a schedule to start tracking your retainer clients here.
        </p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary"
          style={{ boxShadow: "0 4px 12px hsl(16 95% 52% / 0.3)" }}
        >
          <Plus size={14} />
          Add first client
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {clientSummaries.map((client) => (
        <ClientCard key={client.name} client={client} onGenerate={onGenerate} onEdit={onEdit} />
      ))}
    </div>
  );
}
