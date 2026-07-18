import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Edit2,
  FileText,
  Calendar,
  Crown,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button, toast } from "@blinkdotnew/ui";
import { cn } from "../lib/utils";
import type { RecurringInvoice } from "../types/recurring";
import { FREQUENCY_LABELS, daysUntil, buildInvoiceFromTemplate } from "../types/recurring";
// import type { InvoiceData } from '../types/invoice'
import { calculateTotals, formatCurrency } from "../types/invoice";
import { useRecurringInvoices } from "../hooks/useRecurringInvoices";
// import { useGeneratedInvoices } from '../hooks/useGeneratedInvoices'
import { RecurringInvoiceModal } from "../components/recurring/RecurringInvoiceModal";
import { useAppContext } from "../layouts/RootLayout";

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

function DueBadge({ nextDueDate }: { nextDueDate: string }) {
  const days = daysUntil(nextDueDate);
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
        <AlertCircle size={10} />
        Overdue
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-warning/10 text-warning">
        Due today
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-warning/10 text-warning">
        In {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      In {days}d
    </span>
  );
}

function RecurringCard({
  item,
  onGenerate,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: RecurringInvoice;
  onGenerate: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { total } = calculateTotals({
    lineItems: item.lineItems,
    taxRate: item.taxRate,
    discountAmount: item.discountAmount,
    currency: item.currency,
  } as Parameters<typeof calculateTotals>[0]);

  const isPaused = item.status === "paused";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-5 transition-shadow hover:shadow-md",
        isPaused ? "bg-muted opacity-80" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: isPaused ? "#b0a89e" : item.accentColor }}
          >
            {item.logoText || item.clientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base truncate text-foreground">{item.clientName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <RotateCcw size={10} />
                {FREQUENCY_LABELS[item.frequency]}
              </span>
              {isPaused && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-muted text-muted-foreground">
                  Paused
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

      {/* Next due + stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 px-3 py-2.5 rounded-xl bg-muted">
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

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isPaused && (
          <button
            onClick={onGenerate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: item.accentColor, boxShadow: `0 4px 12px ${item.accentColor}55` }}
          >
            <RefreshCw size={14} />
            Generate Invoice
          </button>
        )}
        {isPaused && (
          <button
            onClick={onToggle}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 bg-accent text-accent-foreground"
          >
            <Play size={14} />
            Resume
          </button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="rounded-xl border border-border text-muted-foreground hover:bg-accent"
          title="Edit"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="rounded-xl border border-border text-muted-foreground hover:bg-accent"
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
          title="Delete"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

// Feature list items for the Pro gate — using a typed array to avoid invalid JSX
const PRO_FEATURES: Array<{ label: string; Icon: React.ElementType }> = [
  { label: "Weekly, monthly, quarterly, annual schedules", Icon: Calendar },
  { label: "Auto-populated invoice templates per client", Icon: FileText },
  { label: "Due date tracking and overdue alerts", Icon: AlertCircle },
  { label: "One-click invoice generation", Icon: RefreshCw },
];

export default function RecurringInvoices() {
  const { user, isPro, onUpgrade } = useAppContext();
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    create,
    update,
    remove,
    toggleStatus,
    markGenerated,
    isCreating,
    isUpdating,
  } = useRecurringInvoices(user?.id ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringInvoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async (data: Parameters<typeof create>[0]) => {
    await create(data);
    toast.success("Recurring invoice created", {
      description: `${data.clientName} · ${FREQUENCY_LABELS[data.frequency]}`,
    });
  };

  const handleUpdate = async (data: Parameters<typeof create>[0]) => {
    if (!editing) return;
    await update({ id: editing.id, ...data });
    toast.success("Changes saved");
    setEditing(null);
  };

  const handleGenerate = async (item: RecurringInvoice) => {
    const count = item.invoiceCount + 1;
    const invoiceNumber = `INV-${String(count).padStart(3, "0")}`;
    const invoiceData = buildInvoiceFromTemplate(item, invoiceNumber);
    await markGenerated(item);
    toast.success(`Invoice generated for ${item.clientName}`, {
      description: `${invoiceNumber} · Opens in invoice creator`,
    });
    sessionStorage.setItem("invoiceflow-seed-invoice", JSON.stringify(invoiceData));
    navigate({ to: "/create" });
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setDeleteConfirm(null);
    toast.success("Recurring invoice deleted");
  };

  const showProGate = !isPro;

  return (
    <div className="min-h-screen flex flex-col bg-muted font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
            className="rounded-lg text-muted-foreground hover:bg-accent"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary">
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-bold text-base text-foreground">
              Invoice<span className="text-primary">Flow</span>
            </span>
          </div>
          <div className="hidden md:block h-5 border-l border-border" />
          <div className="hidden md:flex items-center gap-2">
            <RotateCcw size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recurring Invoices</span>
          </div>
        </div>

        {!showProGate && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] bg-primary shadow-md"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Schedule</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Pro gate */}
        {showProGate && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-accent">
              <Crown size={28} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Recurring Invoices</h2>
            <p className="text-base max-w-sm mb-1 text-muted-foreground">
              Set up automatic invoice schedules for retainer clients and ongoing contracts.
            </p>
            <p className="text-sm mb-8 text-muted-foreground">Available on Pro and Agency plans.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left max-w-md w-full">
              {PRO_FEATURES.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card"
                >
                  <Icon size={14} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onUpgrade("pro")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] bg-primary shadow-md"
            >
              <Sparkles size={14} />
              Upgrade to Pro — $12/mo
            </button>
          </div>
        )}

        {/* Pro content */}
        {!showProGate && (
          <>
            {/* Summary strip */}
            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    label: "Active Schedules",
                    value: items.filter((i) => i.status === "active").length,
                  },
                  {
                    label: "Due This Week",
                    value: items.filter(
                      (i) => i.status === "active" && daysUntil(i.nextDueDate) <= 7,
                    ).length,
                  },
                  {
                    label: "Total Generated",
                    value: items.reduce((s, i) => s + i.invoiceCount, 0),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border px-5 py-4 bg-card"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-accent">
                  <RotateCcw size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1 text-foreground">
                  No recurring invoices yet
                </h3>
                <p className="text-sm mb-6 max-w-xs text-muted-foreground">
                  Set up a schedule for retainer clients and generate invoices in one click.
                </p>
                <button
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-md"
                >
                  <Plus size={14} />
                  Create your first schedule
                </button>
              </div>
            )}

            {/* Cards grid */}
            {!isLoading && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <RecurringCard
                    key={item.id}
                    item={item}
                    onGenerate={() => handleGenerate(item)}
                    onEdit={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    onToggle={() => {
                      toggleStatus(item).then(() =>
                        toast.success(
                          item.status === "active" ? "Schedule paused" : "Schedule resumed",
                        ),
                      );
                    }}
                    onDelete={() => setDeleteConfirm(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create / Edit modal */}
      {user && (
        <RecurringInvoiceModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={editing ? handleUpdate : handleCreate}
          initial={editing}
          userId={user.id}
          isSaving={isCreating || isUpdating}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl bg-card">
            <h3 className="text-base font-bold mb-2 text-foreground">Delete recurring invoice?</h3>
            <p className="text-sm mb-5 text-muted-foreground">
              This schedule will be permanently deleted. Past invoices are not affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium border border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 bg-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
