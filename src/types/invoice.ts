export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;

  // From (sender)
  fromName: string;
  fromEmail: string;
  fromAddress: string;

  // To (client)
  toName: string;
  toEmail: string;
  toAddress: string;

  // Items
  lineItems: LineItem[];

  // Totals
  taxRate: number;
  discountAmount: number;
  notes: string;

  // Branding
  accentColor: string;
  logoText: string;
  logoUrl?: string | null;
}

export const defaultInvoice: InvoiceData = {
  invoiceNumber: "INV-001",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  currency: "USD",

  fromName: "Your Name",
  fromEmail: "you@example.com",
  fromAddress: "123 Main St, City, Country",

  toName: "",
  toEmail: "",
  toAddress: "",

  lineItems: [{ id: "1", description: "Design Services", quantity: 1, rate: 1500 }],

  taxRate: 0,
  discountAmount: 0,
  notes: "Payment due within 30 days. Thank you for your business!",

  accentColor: "hsl(16 95% 52%)",
  logoText: "YS",
};

export const CURRENCIES: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
  INR: "₹",
  BRL: "R$",
};

export function calculateTotals(invoice: InvoiceData) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const discount = invoice.discountAmount || 0;
  const taxable = subtotal - discount;
  const tax = taxable * (invoice.taxRate / 100);
  const total = taxable + tax;

  return { subtotal, discount, tax, total };
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCIES[currency] || "$";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
