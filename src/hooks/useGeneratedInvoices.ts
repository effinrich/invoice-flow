import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '../blink/client'
import type { InvoiceData } from '../types/invoice'
import { calculateTotals } from '../types/invoice'

export type InvoiceStatus = 'pending' | 'paid' | 'overdue'

export interface GeneratedInvoice {
  id: string
  userId: string
  recurringInvoiceId: string | null
  invoiceNumber: string
  clientName: string
  clientEmail: string
  invoiceData: InvoiceData
  amount: number
  currency: string
  status: InvoiceStatus
  stripeCheckoutSessionId: string | null
  stripePaymentUrl: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

const QK = 'generated-invoices'

function rowToModel(row: Record<string, unknown>): GeneratedInvoice {
  let invoiceData: InvoiceData
  try {
    invoiceData = JSON.parse(row.invoice_data as string)
  } catch {
    invoiceData = {} as InvoiceData
  }
  return {
    id: row.id as string,
    userId: row.user_id as string,
    recurringInvoiceId: (row.recurring_invoice_id as string) ?? null,
    invoiceNumber: row.invoice_number as string,
    clientName: row.client_name as string,
    clientEmail: (row.client_email as string) ?? '',
    invoiceData,
    amount: Number(row.amount ?? 0),
    currency: (row.currency as string) ?? 'USD',
    status: (row.status as InvoiceStatus) ?? 'pending',
    stripeCheckoutSessionId: (row.stripe_checkout_session_id as string) ?? null,
    stripePaymentUrl: (row.stripe_payment_url as string) ?? null,
    paidAt: (row.paid_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useGeneratedInvoices(userId: string | null) {
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: [QK, userId],
    queryFn: async () => {
      if (!userId) return []
      const rows = await blink.db.generatedInvoices.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        limit: 100,
      })
      return (rows as Record<string, unknown>[]).map(rowToModel)
    },
    enabled: !!userId,
  })

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: [QK, userId] })
  }, [qc, userId])

  const createMutation = useMutation({
    mutationFn: async (params: {
      userId: string
      recurringInvoiceId: string | null
      invoiceData: InvoiceData
      stripePaymentUrl: string | null
    }) => {
      const { total } = calculateTotals(params.invoiceData)
      const now = new Date().toISOString()
      const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      await blink.db.generatedInvoices.create({
        id,
        user_id: params.userId,
        recurring_invoice_id: params.recurringInvoiceId ?? null,
        invoice_number: params.invoiceData.invoiceNumber,
        client_name: params.invoiceData.toName,
        client_email: params.invoiceData.toEmail,
        invoice_data: JSON.stringify(params.invoiceData),
        amount: total,
        currency: params.invoiceData.currency,
        status: 'pending',
        stripe_checkout_session_id: null,
        stripe_payment_url: params.stripePaymentUrl ?? null,
        paid_at: null,
        created_at: now,
        updated_at: now,
      })
      return id
    },
    onSuccess: invalidate,
  })

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString()
      await blink.db.generatedInvoices.update(id, {
        status: 'paid',
        paid_at: now,
        updated_at: now,
      })
    },
    onSuccess: invalidate,
  })

  const markPendingMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.generatedInvoices.update(id, {
        status: 'pending',
        paid_at: null,
        updated_at: new Date().toISOString(),
      })
    },
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blink.db.generatedInvoices.delete(id)
    },
    onSuccess: invalidate,
  })

  return {
    items,
    isLoading,
    create: createMutation.mutateAsync,
    markPaid: markPaidMutation.mutateAsync,
    markPending: markPendingMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  }
}

/** Public fetch — no auth required (used by client portal) */
export async function fetchPublicInvoice(invoiceId: string): Promise<GeneratedInvoice | null> {
  try {
    const rows = await blink.db.generatedInvoices.list({
      where: { id: invoiceId },
      limit: 1,
    })
    if (!rows || rows.length === 0) return null
    return rowToModel(rows[0] as Record<string, unknown>)
  } catch {
    return null
  }
}
