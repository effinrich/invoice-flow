import { useEffect, useState } from "react";
import {
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@blinkdotnew/ui";
import { fetchPublicInvoice, type GeneratedInvoice } from "../hooks/useGeneratedInvoices";
import InvoicePreview from "../components/invoice/InvoicePreview";

interface Props {
  invoiceId: string;
  onBack?: () => void;
}

function StatusBadge({ status, accent }: { status: GeneratedInvoice["status"]; accent: string }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-[hsl(151_55%_93%)] text-[hsl(151_55%_25%)]">
        <CheckCircle2 size={14} />
        Paid
      </span>
    );
  }
  if (status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-destructive/10 text-destructive">
        <AlertCircle size={14} />
        Overdue
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
      style={{ background: `${accent}18`, color: accent }}
    >
      <Clock size={14} />
      Awaiting Payment
    </span>
  );
}

export default function ClientPortal({ invoiceId, onBack }: Props) {
  const [invoice, setInvoice] = useState<GeneratedInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicInvoice(invoiceId).then((result) => {
      if (cancelled) return;
      if (!result) setNotFound(true);
      else setInvoice(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const accent = invoice?.invoiceData?.accentColor || "hsl(16 95% 52%)";
  const accentLight = `${accent}18`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Link copied to clipboard");
    });
  };

  const handlePay = () => {
    if (!invoice?.stripePaymentUrl) return;
    window.open(invoice.stripePaymentUrl, "_blank");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-background"
        style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-accent">
          <FileText size={24} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-foreground">Invoice not found</h2>
        <p className="text-sm text-center max-w-xs mb-6 text-muted-foreground">
          This invoice link may be invalid or has been removed. Contact your service provider for a
          new link.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-primary"
          >
            <ArrowLeft size={14} />
            Back to home
          </button>
        )}
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const hasPaymentLink = !!invoice.stripePaymentUrl;
  const inv = invoice.invoiceData;
  const logoUrl = inv?.logoUrl;
  const fromName = inv?.fromName || "Your service provider";
  const logoInitials = (inv?.logoText || fromName.slice(0, 2)).toUpperCase();

  return (
    <div
      className="min-h-screen bg-muted"
      style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
    >
      {/* Branded header */}
      <header className="border-b px-4 md:px-6 h-16 flex items-center justify-between bg-card border-border">
        {/* Freelancer's brand */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={fromName}
              className="w-8 h-8 rounded-lg object-contain border border-border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: accent }}
            >
              {logoInitials.slice(0, 2)}
            </div>
          )}
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">{fromName}</p>
            <p className="text-xs leading-tight text-muted-foreground">Invoice Portal</p>
          </div>
        </div>

        {/* Status + copy */}
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} accent={accent} />
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg border transition-colors hover:bg-gray-50 border-border text-muted-foreground"
            title="Copy invoice link"
          >
            <Copy size={14} />
          </button>
        </div>
      </header>

      {/* Thin accent bar */}
      <div className="h-0.5 w-full" style={{ background: accent }} />

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Payment action card */}
        {!isPaid && (
          <div
            className="rounded-2xl border mb-6 overflow-hidden bg-card border-border"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
          >
            {/* Card header with accent background */}
            <div
              className="px-6 py-4 border-b"
              style={{ background: accentLight, borderColor: `${accent}30` }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: accent }}
                  >
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Invoice from {fromName}</p>
                    <p className="text-xs mt-0.5 text-foreground">
                      {invoice.invoiceNumber} · Due {formatDate(inv?.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                    Amount Due
                  </p>
                  <p className="text-2xl font-bold font-mono" style={{ color: accent }}>
                    {formatAmount(invoice.amount, invoice.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              {hasPaymentLink ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePay}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: accent, boxShadow: `0 4px 14px ${accent}55` }}
                  >
                    <CreditCard size={15} />
                    Pay {formatAmount(invoice.amount, invoice.currency)} now
                    <ExternalLink size={13} className="opacity-70" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50 border-border text-foreground"
                  >
                    <Copy size={14} />
                    Copy Link
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-background border border-border">
                  <AlertCircle size={16} className="text-muted-foreground shrink-0 mt-px" />
                  <p className="text-sm text-foreground">
                    Online payment is not set up for this invoice. Please contact{" "}
                    <strong>{fromName}</strong> directly to arrange payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paid confirmation */}
        {isPaid && (
          <div className="rounded-2xl border mb-6 px-6 py-5 flex items-center gap-4 bg-[hsl(151_55%_97%)] border-[hsl(151_55%_80%)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[hsl(151_55%_93%)]">
              <CheckCircle2 size={20} className="text-[hsl(151_55%_35%)]" />
            </div>
            <div>
              <p className="font-bold text-[hsl(151_55%_25%)]">Payment received — thank you!</p>
              <p className="text-sm mt-0.5 text-[hsl(151_55%_35%)]">
                This invoice was marked as paid
                {invoice.paidAt ? ` on ${formatDate(invoice.paidAt.split("T")[0])}` : ""}.
              </p>
            </div>
          </div>
        )}

        {/* Invoice preview — always uses brand colors / logo */}
        <div className="w-full">
          <InvoicePreview invoice={inv} isPro={true} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-8 pb-8">
          <p className="text-xs text-[#c8b8a8]">Powered by</p>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-primary">
              <FileText size={9} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">InvoiceFlow</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr?: string) {
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

function formatAmount(amount: number, currency: string) {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
    BRL: "R$",
  };
  return `${symbols[currency] || "$"}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
