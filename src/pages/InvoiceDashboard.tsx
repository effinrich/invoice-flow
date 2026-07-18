import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  Download,
  Trash2,
  Plus,
  FileText,
  CircleDollarSign,
  Clock3,
  BadgeCheck,
} from "lucide-react";
import { toast } from "@blinkdotnew/ui";
import { useAppContext } from "../layouts/RootLayout";
import { useGeneratedInvoices, type GeneratedInvoice } from "../hooks/useGeneratedInvoices";
import { downloadInvoicePdf } from "../lib/downloadInvoicePdf";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: GeneratedInvoice["status"] }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <BadgeCheck className="h-3.5 w-3.5" />
        Paid
      </span>
    );
  }
  if (status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        <Clock3 className="h-3.5 w-3.5" />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export default function InvoiceDashboard() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { items, isLoading, remove } = useGeneratedInvoices(user?.id ?? null);

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((i) => i.status === "pending").length,
      paid: items.filter((i) => i.status === "paid").length,
      overdue: items.filter((i) => i.status === "overdue").length,
    }),
    [items],
  );

  const handleView = (invoice: GeneratedInvoice) => {
    navigate({ to: `/portal/$invoiceId`, params: { invoiceId: invoice.id } });
  };

  const handleDownload = async (invoice: GeneratedInvoice) => {
    try {
      await downloadInvoicePdf({ invoice });
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not download PDF");
    }
  };

  const handleDelete = async (invoice: GeneratedInvoice) => {
    const ok = window.confirm(`Delete invoice ${invoice.invoiceNumber}?`);
    if (!ok) return;
    await remove(invoice.id);
    toast.success("Invoice deleted");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Your invoices</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoice history</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track saved invoices, mark payments, and reopen any invoice in one click.
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/create" })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New invoice
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Pending" value={stats.pending} icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Paid" value={stats.paid} icon={<BadgeCheck className="h-4 w-4" />} />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Recent invoices</h2>
        </div>

        {isLoading ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            Loading invoices...
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold text-foreground">No invoices yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first invoice and it will appear here.
            </p>
            <button
              onClick={() => navigate({ to: "/create" })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Invoice</th>
                  <th className="px-5 py-3 font-semibold">Client</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">{invoice.currency}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{invoice.clientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.clientEmail || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
