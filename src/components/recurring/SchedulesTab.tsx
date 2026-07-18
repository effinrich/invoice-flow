import {
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Edit2,
  Copy,
  Link2,
  CreditCard,
  RotateCcw,
  Plus,
} from "lucide-react";
import type { RecurringInvoice } from "../../types/recurring";
import { FREQUENCY_LABELS } from "../../types/recurring";
import { calculateTotals, formatCurrency } from "../../types/invoice";
import { DueBadge } from "./DueBadge";

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

export interface SchedulesTabProps {
  items: RecurringInvoice[];
  lastGeneratedMap: Record<string, string>;
  onGenerate: (item: RecurringInvoice) => void;
  onEdit: (item: RecurringInvoice) => void;
  onToggle: (item: RecurringInvoice) => void;
  onDelete: (id: string) => void;
  onCopyPortalLink: (invoiceId: string) => void;
  onViewPortal: (invoiceId: string) => void;
  onNew: () => void;
}

function RecurringCard({
  item,
  onGenerate,
  onEdit,
  onToggle,
  onDelete,
  lastInvoiceId,
  onCopyPortalLink,
  onViewPortal,
}: {
  item: RecurringInvoice;
  onGenerate: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  lastInvoiceId?: string | null;
  onCopyPortalLink?: () => void;
  onViewPortal?: () => void;
}) {
  const { total } = calculateTotals({
    lineItems: item.lineItems,
    taxRate: item.taxRate,
    discountAmount: item.discountAmount,
    currency: item.currency,
  } as Parameters<typeof calculateTotals>[0]);
  const isPaused = item.status === "paused";
  const hasPaymentLink = !!item.stripePaymentLinkUrl;

  return (
    <div
      className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${
        isPaused ? "bg-background border-border opacity-80" : "bg-card border-[#e2d8d0] opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {item.logoUrl ? (
            <img
              src={item.logoUrl}
              alt=""
              className="w-10 h-10 rounded-xl object-contain border shrink-0 border-border bg-card"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: isPaused ? "#b0a89e" : item.accentColor }}
            >
              {item.logoText || item.clientName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-base truncate text-foreground">{item.clientName}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <RotateCcw size={10} />
                {FREQUENCY_LABELS[item.frequency]}
              </span>
              {isPaused && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-muted text-muted-foreground">
                  Paused
                </span>
              )}
              {hasPaymentLink && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold bg-[hsl(151_55%_93%)] text-[hsl(151_55%_30%)]">
                  <CreditCard size={9} />
                  Pay enabled
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold font-mono text-foreground">
            {formatCurrency(total, item.currency)}
          </p>
          <p className="text-xs text-muted-foreground">per invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 px-3 py-2.5 rounded-xl bg-background">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5 text-muted-foreground">
            Next Due
          </p>
          <p className="text-xs font-medium mb-1 text-foreground">{formatDate(item.nextDueDate)}</p>
          <DueBadge nextDueDate={item.nextDueDate} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5 text-muted-foreground">
            Generated
          </p>
          <p className="text-sm font-bold text-foreground">{item.invoiceCount}</p>
          <p className="text-xs text-muted-foreground">invoices</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-0.5 text-muted-foreground">
            Last
          </p>
          <p className="text-xs font-medium text-foreground">
            {item.lastGeneratedAt ? formatDate(item.lastGeneratedAt.split("T")[0]) : "—"}
          </p>
        </div>
      </div>

      {lastInvoiceId && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl mb-3 border bg-[hsl(16_95%_97%)] border-[hsl(16_60%_88%)]">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 size={12} className="text-primary shrink-0" />
            <span className="text-xs font-medium truncate text-[hsl(16_80%_35%)]">
              Client portal ready
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onCopyPortalLink}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-orange-100 text-primary"
            >
              <Copy size={11} />
              Copy
            </button>
            <button
              onClick={onViewPortal}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-orange-100 text-primary"
            >
              View
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isPaused ? (
          <button
            onClick={onGenerate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: item.accentColor, boxShadow: `0 4px 12px ${item.accentColor}55` }}
          >
            <RefreshCw size={14} />
            Generate Invoice
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 bg-[hsl(16_95%_96%)] text-[hsl(16_80%_35%)]"
          >
            <Play size={14} />
            Resume
          </button>
        )}
        <button
          onClick={onEdit}
          className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-orange-50 border-border text-foreground"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-orange-50 border-border text-foreground"
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-red-50 border-border text-muted-foreground hover:text-destructive hover:border-red-300"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptySchedules({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[hsl(16_95%_96%)]">
        <RotateCcw size={24} className="text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-1 text-foreground">No recurring schedules yet</h3>
      <p className="text-sm mb-6 max-w-sm text-muted-foreground">
        Set up automated billing for retainers, subscriptions, and monthly service agreements.
      </p>
      <div className="flex flex-col gap-3 mb-6 text-left max-w-xs w-full">
        {[
          { step: "1", text: "Create a schedule — set client, services, and frequency" },
          { step: "2", text: "Add a Stripe Payment Link for online payment collection" },
          { step: "3", text: 'Click "Generate" each period — a shareable portal is created' },
          { step: "4", text: "Client pays via Stripe; track status in the History tab" },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 bg-[hsl(16_95%_96%)] text-primary">
              {step}
            </div>
            <p className="text-sm text-foreground">{text}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary"
        style={{ boxShadow: "0 4px 12px hsl(16 95% 52% / 0.3)" }}
      >
        <Plus size={14} />
        Create first schedule
      </button>
    </div>
  );
}

export function SchedulesTab({
  items,
  lastGeneratedMap,
  onGenerate,
  onEdit,
  onToggle,
  onDelete,
  onCopyPortalLink,
  onViewPortal,
  onNew,
}: SchedulesTabProps) {
  if (items.length === 0) return <EmptySchedules onNew={onNew} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <RecurringCard
          key={item.id}
          item={item}
          onGenerate={() => onGenerate(item)}
          onEdit={() => onEdit(item)}
          onToggle={() => onToggle(item)}
          onDelete={() => onDelete(item.id)}
          lastInvoiceId={lastGeneratedMap[item.id] ?? null}
          onCopyPortalLink={() => {
            const lid = lastGeneratedMap[item.id];
            if (lid) onCopyPortalLink(lid);
          }}
          onViewPortal={() => {
            const lid = lastGeneratedMap[item.id];
            if (lid) onViewPortal(lid);
          }}
        />
      ))}
    </div>
  );
}
