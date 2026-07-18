import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@blinkdotnew/ui";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import type { RecurringInvoice, Frequency } from "../../types/recurring";
import { FREQUENCY_OPTIONS, getNextDueDate } from "../../types/recurring";
import type { LineItem } from "../../types/invoice";
import { CURRENCIES } from "../../types/invoice";
import { BrandingSection } from "./BrandingSection";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<
      RecurringInvoice,
      "id" | "createdAt" | "updatedAt" | "invoiceCount" | "lastGeneratedAt"
    >,
  ) => Promise<unknown>;
  initial?: RecurringInvoice | null;
  userId: string;
  isSaving?: boolean;
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border text-foreground bg-card outline-none transition-colors focus:ring-2";
const focusRingStyle = "focus:ring-orange-200 focus:border-orange-400";
const labelCls =
  "block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground";

function genId() {
  return `li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function RecurringInvoiceModal({ open, onClose, onSave, initial, userId, isSaving }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("Payment due within 30 days. Thank you for your business!");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [startDate, setStartDate] = useState(today);
  const [accentColor, setAccentColor] = useState("hsl(16 95% 52%)");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [stripePaymentLinkUrl, setStripePaymentLinkUrl] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: genId(), description: "Service", quantity: 1, rate: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (initial) {
      setClientName(initial.clientName);
      setClientEmail(initial.clientEmail);
      setClientAddress(initial.clientAddress);
      setFromName(initial.fromName);
      setFromEmail(initial.fromEmail);
      setFromAddress(initial.fromAddress);
      setCurrency(initial.currency);
      setTaxRate(initial.taxRate);
      setDiscountAmount(initial.discountAmount);
      setNotes(initial.notes);
      setFrequency(initial.frequency);
      setStartDate(initial.startDate);
      setStripePaymentLinkUrl(initial.stripePaymentLinkUrl ?? "");
      setAccentColor(initial.accentColor ?? "hsl(16 95% 52%)");
      setLogoUrl(initial.logoUrl ?? null);
      setLineItems(
        initial.lineItems.length
          ? initial.lineItems
          : [{ id: genId(), description: "Service", quantity: 1, rate: 0 }],
      );
    } else {
      // Reset for new
      setClientName("");
      setClientEmail("");
      setClientAddress("");
      setFromName("");
      setFromEmail("");
      setFromAddress("");
      setCurrency("USD");
      setTaxRate(0);
      setDiscountAmount(0);
      setNotes("Payment due within 30 days. Thank you for your business!");
      setFrequency("monthly");
      setStartDate(today);
      setAccentColor("hsl(16 95% 52%)");
      setLogoUrl(null);
      setStripePaymentLinkUrl("");
      setLineItems([{ id: genId(), description: "Service", quantity: 1, rate: 0 }]);
    }
    setErrors({});
  }, [initial, open]);

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { id: genId(), description: "", quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => prev.map((li) => (li.id === id ? { ...li, [field]: value } : li)));
  };

  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = "Client name is required";
    if (!lineItems.length) e.lineItems = "Add at least one line item";
    const hasItems = lineItems.some((li) => li.description.trim() && li.rate > 0);
    if (!hasItems) e.lineItems = "At least one item needs a description and rate";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const nextDue = getNextDueDate(new Date(startDate + "T12:00:00"), frequency);
    await onSave({
      userId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientAddress: clientAddress.trim(),
      fromName: fromName.trim(),
      fromEmail: fromEmail.trim(),
      fromAddress: fromAddress.trim(),
      lineItems,
      currency,
      taxRate,
      discountAmount,
      notes,
      accentColor,
      logoText: initial?.logoText ?? (clientName.trim().slice(0, 2).toUpperCase() || "YS"),
      logoUrl,
      frequency,
      status: initial?.status ?? "active",
      startDate,
      nextDueDate: nextDue.toISOString().split("T")[0],
      stripePaymentLinkUrl: stripePaymentLinkUrl.trim() || null,
      autoEmailEnabled: initial?.autoEmailEnabled ?? false,
      daysBefore: initial?.daysBefore ?? 3,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      {/* @ts-expect-error Blink UI (shadcn-based) Dialog typed for React 18; under React 19 types it spuriously requires placeholder/onPointerEnterCapture. */}
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10 border-border">
          {/* @ts-expect-error See DialogContent note above — Blink UI React-18 types under React 19. */}
          <DialogTitle className="text-lg font-bold text-foreground">
            {initial ? "Edit Recurring Invoice" : "New Recurring Invoice"}
          </DialogTitle>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {initial
              ? "Update the template details."
              : "Set up a template that generates invoices on a schedule."}
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* Schedule */}
          <section>
            <h3 className="text-sm font-bold mb-3 text-foreground">Schedule</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  className={`${inputCls} ${focusRingStyle}`}
                >
                  {FREQUENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${inputCls} ${focusRingStyle}`}
                />
              </div>
            </div>
          </section>

          {/* Client */}
          <section>
            <h3 className="text-sm font-bold mb-3 text-foreground">Bill To</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Client Name *</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Inc."
                  className={`${inputCls} ${focusRingStyle}`}
                  style={{ borderColor: errors.clientName ? "#ef4444" : "#e8e0d8" }}
                />
                {errors.clientName && (
                  <p className="text-xs mt-1 text-destructive">{errors.clientName}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="billing@acme.com"
                    className={`${inputCls} ${focusRingStyle}`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <input
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="123 Main St, City"
                    className={`${inputCls} ${focusRingStyle}`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* From */}
          <section>
            <h3 className="text-sm font-bold mb-3 text-foreground">From (You)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Your Name</label>
                  <input
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Your Name"
                    className={`${inputCls} ${focusRingStyle}`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Your Email</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputCls} ${focusRingStyle}`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Your Address</label>
                <input
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  placeholder="456 Studio Ave, City"
                  className={`${inputCls} ${focusRingStyle}`}
                />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Services / Line Items</h3>
              <span className="text-xs text-muted-foreground">
                Subtotal: {CURRENCIES[currency] || "$"}
                {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {errors.lineItems && (
              <p className="text-xs mb-2 text-destructive">{errors.lineItems}</p>
            )}

            <div className="space-y-2 mb-3">
              {/* Header row */}
              <div className="grid gap-2 text-xs font-semibold uppercase tracking-wider px-1 text-muted-foreground grid-cols-[1fr_64px_100px_32px]">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Rate</span>
                <span />
              </div>

              {lineItems.map((li) => (
                <div
                  key={li.id}
                  className="grid gap-2 items-center grid-cols-[1fr_64px_100px_32px]"
                >
                  <input
                    value={li.description}
                    onChange={(e) => updateLineItem(li.id, "description", e.target.value)}
                    placeholder="Service description"
                    className={`${inputCls} ${focusRingStyle}`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={li.quantity}
                    onChange={(e) =>
                      updateLineItem(li.id, "quantity", parseFloat(e.target.value) || 0)
                    }
                    className={`${inputCls} ${focusRingStyle} text-center`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={li.rate}
                    onChange={(e) => updateLineItem(li.id, "rate", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`${inputCls} ${focusRingStyle} text-right font-mono`}
                  />
                  <button
                    onClick={() => removeLineItem(li.id)}
                    disabled={lineItems.length <= 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-30 text-muted-foreground"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef0eb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addLineItem}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-primary"
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fef0eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Plus size={14} /> Add line item
            </button>
          </section>

          {/* Totals + Notes */}
          <section>
            <h3 className="text-sm font-bold mb-3 text-foreground">Details</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${inputCls} ${focusRingStyle}`}
                >
                  {Object.keys(CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className={`${inputCls} ${focusRingStyle}`}
                />
              </div>
              <div>
                <label className={labelCls}>Discount ($)</label>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className={`${inputCls} ${focusRingStyle}`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Payment terms, bank details, etc."
                className={`${inputCls} ${focusRingStyle} resize-none`}
              />
            </div>
          </section>

          {/* Branding */}
          <section>
            <h3 className="text-sm font-bold mb-3 text-foreground">Branding</h3>
            <p className="text-xs mb-4 text-muted-foreground">
              Your logo and brand color appear on every generated invoice and the client payment
              portal.
            </p>
            <BrandingSection
              accentColor={accentColor}
              logoUrl={logoUrl}
              logoText={clientName.trim().slice(0, 2).toUpperCase() || "YS"}
              onColorChange={setAccentColor}
              onLogoUrlChange={setLogoUrl}
            />
          </section>

          {/* Stripe Payment */}
          <section>
            <h3 className="text-sm font-bold mb-1 text-foreground">Online Payment (optional)</h3>
            <p className="text-xs mb-3 text-muted-foreground">
              Paste a Stripe Payment Link so clients can pay this invoice online. Create one at{" "}
              <a
                href="https://dashboard.stripe.com/payment-links"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline text-primary"
              >
                dashboard.stripe.com/payment-links <ExternalLink size={10} />
              </a>
            </p>
            <div>
              <label className={labelCls}>Stripe Payment Link URL</label>
              <input
                type="url"
                value={stripePaymentLinkUrl}
                onChange={(e) => setStripePaymentLinkUrl(e.target.value)}
                placeholder="https://buy.stripe.com/..."
                className={`${inputCls} ${focusRingStyle}`}
              />
              {stripePaymentLinkUrl && !stripePaymentLinkUrl.startsWith("https://") && (
                <p className="text-xs mt-1 text-destructive">Must be a valid https:// URL</p>
              )}
              {stripePaymentLinkUrl && stripePaymentLinkUrl.startsWith("https://") && (
                <p className="text-xs mt-1 flex items-center gap-1 text-[hsl(151_55%_35%)]">
                  ✓ Clients will see a "Pay Now" button on their invoice portal
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3 sticky bottom-0 bg-white border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50 border-border text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 bg-primary"
            style={{ boxShadow: "0 4px 12px hsl(16 95% 52% / 0.3)" }}
          >
            {isSaving ? "Saving…" : initial ? "Save Changes" : "Create Schedule"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
