/**
 * useAutoGenerate
 *
 * On mount (once per user session), scans all active recurring invoices.
 * For any schedule where:
 *   - autoEmailEnabled = true
 *   - status = 'active'
 *   - today >= (nextDueDate - daysBefore)
 *   - the invoice hasn't already been generated this cycle
 *       (lastGeneratedAt is null OR before the trigger date)
 *
 * It will:
 *   1. Create a generated_invoices record
 *   2. Send an email to the client via blink.notifications.email()
 *   3. Advance the recurring schedule (next_due_date, last_generated_at, invoice_count)
 *   4. Show a toast for each email sent
 */
import { useEffect, useRef } from 'react'
import { blink } from '../blink/client'
import { toast } from '@blinkdotnew/ui'
import type { RecurringInvoice } from '../types/recurring'
import { buildInvoiceFromTemplate, getNextDueDate } from '../types/recurring'
import { calculateTotals } from '../types/invoice'
import { buildInvoiceEmailHtml, buildInvoiceEmailText } from '../lib/invoiceEmail'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

/** Returns the ISO date string for (nextDueDate - daysBefore) */
function triggerDate(nextDueDateStr: string, daysBefore: number): string {
  const d = new Date(nextDueDateStr + 'T12:00:00')
  d.setDate(d.getDate() - daysBefore)
  return d.toISOString().split('T')[0]
}

/** True if the invoice for this cycle has NOT yet been generated */
function shouldTrigger(item: RecurringInvoice): boolean {
  const today = todayStr()
  const trigger = triggerDate(item.nextDueDate, item.daysBefore)
  if (today < trigger) return false // too early

  // If it was already generated after the trigger date for this cycle, skip
  if (item.lastGeneratedAt) {
    const generatedDay = item.lastGeneratedAt.split('T')[0]
    if (generatedDay >= trigger) return false
  }

  return true
}

async function generateAndSend(
  item: RecurringInvoice,
  userId: string,
  portalBaseUrl: string,
) {
  const invoiceNumber = `INV-${item.invoiceCount + 1}-${Date.now().toString(36).toUpperCase()}`
  const invoiceData = buildInvoiceFromTemplate(item, invoiceNumber)
  const { total } = calculateTotals(invoiceData)

  // 1. Store generated invoice
  const now = new Date().toISOString()
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  await blink.db.generatedInvoices.create({
    id: invoiceId,
    user_id: userId,
    recurring_invoice_id: item.id,
    invoice_number: invoiceNumber,
    client_name: invoiceData.toName,
    client_email: invoiceData.toEmail,
    invoice_data: JSON.stringify(invoiceData),
    amount: total,
    currency: invoiceData.currency,
    status: 'pending',
    stripe_checkout_session_id: null,
    stripe_payment_url: item.stripePaymentLinkUrl ?? null,
    paid_at: null,
    created_at: now,
    updated_at: now,
  })

  // 2. Send email if client has an email address
  if (item.clientEmail) {
    const html = buildInvoiceEmailHtml({ template: item, invoiceData, invoiceId, portalBaseUrl })
    const text = buildInvoiceEmailText({ template: item, invoiceData, invoiceId, portalBaseUrl })

    await blink.notifications.email({
      to: item.clientEmail,
      replyTo: item.fromEmail || undefined,
      subject: `Invoice #${invoiceNumber} from ${item.fromName || 'Your service provider'} – Due ${invoiceData.dueDate}`,
      html,
      text,
    })
  }

  // 3. Advance the schedule
  const nextDue = getNextDueDate(new Date(item.nextDueDate + 'T12:00:00'), item.frequency)
  await blink.db.recurringInvoices.update(item.id, {
    last_generated_at: now,
    next_due_date: nextDue.toISOString().split('T')[0],
    invoice_count: item.invoiceCount + 1,
    updated_at: now,
  })

  return { invoiceId, clientEmail: item.clientEmail, clientName: item.clientName }
}

export function useAutoGenerate(userId: string | null) {
  const hasRun = useRef(false)

  useEffect(() => {
    if (!userId || hasRun.current) return
    hasRun.current = true

    const portalBaseUrl = window.location.origin

    const run = async () => {
      try {
        // Fetch all active recurring invoices for the user
        const rows = await blink.db.recurringInvoices.list({
          where: { userId, status: 'active' },
        })

        if (!rows || rows.length === 0) return

        // Parse rows into model objects
        const items: RecurringInvoice[] = (rows as Record<string, unknown>[]).map(row => ({
          id: row.id as string,
          userId: row.user_id as string,
          clientName: (row.client_name as string) ?? '',
          clientEmail: (row.client_email as string) ?? '',
          clientAddress: (row.client_address as string) ?? '',
          fromName: (row.from_name as string) ?? '',
          fromEmail: (row.from_email as string) ?? '',
          fromAddress: (row.from_address as string) ?? '',
          lineItems: JSON.parse((row.line_items as string) || '[]'),
          currency: (row.currency as string) ?? 'USD',
          taxRate: Number(row.tax_rate ?? 0),
          discountAmount: Number(row.discount_amount ?? 0),
          notes: (row.notes as string) ?? '',
          accentColor: (row.accent_color as string) ?? 'hsl(16 95% 52%)',
          logoText: (row.logo_text as string) ?? 'YS',
          logoUrl: (row.logo_url as string) ?? null,
          frequency: row.frequency as RecurringInvoice['frequency'],
          status: row.status as RecurringInvoice['status'],
          startDate: row.start_date as string,
          nextDueDate: row.next_due_date as string,
          lastGeneratedAt: (row.last_generated_at as string) ?? null,
          invoiceCount: Number(row.invoice_count ?? 0),
          stripePaymentLinkUrl: (row.stripe_payment_link_url as string) ?? null,
          autoEmailEnabled: Number(row.auto_email_enabled ?? 0) > 0,
          daysBefore: Number(row.days_before_due ?? 3),
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        }))

        // Filter to only schedules that should fire today
        const due = items.filter(item => item.autoEmailEnabled && shouldTrigger(item))
        if (due.length === 0) return

        // Process each one sequentially to avoid race conditions
        for (const item of due) {
          try {
            const result = await generateAndSend(item, userId, portalBaseUrl)
            if (result.clientEmail) {
              toast.success(`Invoice sent to ${result.clientName}`, {
                description: `Auto-generated and emailed to ${result.clientEmail}`,
              })
            } else {
              toast.success(`Invoice generated for ${result.clientName}`, {
                description: 'No client email on file — invoice saved to history.',
              })
            }
          } catch (err) {
            console.error(`[AutoGenerate] Failed for ${item.clientName}:`, err)
            toast.error(`Auto-send failed for ${item.clientName}`, {
              description: 'Check your recurring invoice settings.',
            })
          }
        }
      } catch (err) {
        // Silent fail — don't disrupt the app if auto-gen encounters a network error
        console.error('[AutoGenerate] Error scanning schedules:', err)
      }
    }

    run()
  }, [userId])
}
