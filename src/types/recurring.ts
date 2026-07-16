import type { LineItem, InvoiceData } from './invoice'

export type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual'
export type RecurringStatus = 'active' | 'paused'

export interface RecurringInvoice {
  id: string
  userId: string
  // Client
  clientName: string
  clientEmail: string
  clientAddress: string
  // Sender
  fromName: string
  fromEmail: string
  fromAddress: string
  // Invoice template
  lineItems: LineItem[]          // stored as JSON string in DB, parsed on read
  currency: string
  taxRate: number
  discountAmount: number
  notes: string
  accentColor: string
  logoText: string
  logoUrl: string | null
  // Schedule
  frequency: Frequency
  status: RecurringStatus
  startDate: string
  nextDueDate: string
  lastGeneratedAt: string | null
  invoiceCount: number
  // Stripe
  stripePaymentLinkUrl: string | null
  // Auto-email
  autoEmailEnabled: boolean
  daysBefore: number
  // Meta
  createdAt: string
  updatedAt: string
}

export interface RecurringInvoiceRow {
  id: string
  user_id: string
  client_name: string
  client_email: string
  client_address: string
  from_name: string
  from_email: string
  from_address: string
  line_items: string  // JSON
  currency: string
  tax_rate: number
  discount_amount: number
  notes: string
  accent_color: string
  logo_text: string
  frequency: string
  status: string
  start_date: string
  next_due_date: string
  last_generated_at: string | null
  invoice_count: number
  auto_email_enabled: number  // 0 or 1 (SQLite)
  days_before_due: number
  created_at: string
  updated_at: string
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannual: 'Every 6 months',
  annual: 'Annual',
}

export const FREQUENCY_OPTIONS: { value: Frequency; label: string; sublabel: string }[] = [
  { value: 'weekly', label: 'Weekly', sublabel: 'Every 7 days' },
  { value: 'monthly', label: 'Monthly', sublabel: 'Same day each month' },
  { value: 'quarterly', label: 'Quarterly', sublabel: 'Every 3 months' },
  { value: 'biannual', label: 'Every 6 months', sublabel: 'Twice a year' },
  { value: 'annual', label: 'Annual', sublabel: 'Once a year' },
]

/** Calculate the next due date from a given date and frequency */
export function getNextDueDate(from: Date, frequency: Frequency): Date {
  const d = new Date(from)
  switch (frequency) {
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'quarterly':
      d.setMonth(d.getMonth() + 3)
      break
    case 'biannual':
      d.setMonth(d.getMonth() + 6)
      break
    case 'annual':
      d.setFullYear(d.getFullYear() + 1)
      break
  }
  return d
}

/** How many days until (or since) a date */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/** Build InvoiceData from a recurring template for generating a new invoice */
export function buildInvoiceFromTemplate(
  template: RecurringInvoice,
  invoiceNumber: string
): InvoiceData {
  const today = new Date().toISOString().split('T')[0]
  const dueDate = getNextDueDate(new Date(), template.frequency).toISOString().split('T')[0]

  return {
    invoiceNumber,
    issueDate: today,
    dueDate,
    currency: template.currency,
    fromName: template.fromName,
    fromEmail: template.fromEmail,
    fromAddress: template.fromAddress,
    toName: template.clientName,
    toEmail: template.clientEmail,
    toAddress: template.clientAddress,
    lineItems: template.lineItems,
    taxRate: template.taxRate,
    discountAmount: template.discountAmount,
    notes: template.notes,
    accentColor: template.accentColor,
    logoText: template.logoText,
    logoUrl: template.logoUrl,
  }
}
