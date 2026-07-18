import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { InvoiceData } from "../types/invoice";
import { calculateTotals } from "../types/invoice";

export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface GeneratedInvoice {
  id: string;
  userId: string;
  recurringInvoiceId: string | null;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  invoiceData: InvoiceData;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const QK = "generated-invoices";

function rowToModel(row: Record<string, any>): GeneratedInvoice {
  let invoiceData: InvoiceData;
  try {
    invoiceData =
      typeof row.invoice_data === "string" ? JSON.parse(row.invoice_data) : row.invoice_data;
  } catch {
    invoiceData = {} as InvoiceData;
  }
  return {
    id: row.id,
    userId: row.user_id,
    recurringInvoiceId: row.recurring_invoice_id ?? null,
    invoiceNumber: row.invoice_number,
    clientName: row.client_name,
    clientEmail: row.client_email ?? "",
    invoiceData,
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? "USD",
    status: (row.status as InvoiceStatus) ?? "pending",
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? null,
    stripePaymentUrl: row.stripe_payment_url ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useGeneratedInvoices(userId: string | null) {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: [QK, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("generated_invoices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map(rowToModel);
    },
    enabled: !!userId,
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: [QK, userId] });
  }, [qc, userId]);

  const createMutation = useMutation({
    mutationFn: async (params: {
      userId: string;
      recurringInvoiceId: string | null;
      invoiceData: InvoiceData;
      stripePaymentUrl: string | null;
    }) => {
      const { total } = calculateTotals(params.invoiceData);
      const now = new Date().toISOString();
      const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const { error } = await supabase.from("generated_invoices").insert({
        id,
        user_id: params.userId,
        recurring_invoice_id: params.recurringInvoiceId ?? null,
        invoice_number: params.invoiceData.invoiceNumber,
        client_name: params.invoiceData.toName,
        client_email: params.invoiceData.toEmail,
        invoice_data: params.invoiceData,
        amount: total,
        currency: params.invoiceData.currency,
        status: "pending",
        stripe_checkout_session_id: null,
        stripe_payment_url: params.stripePaymentUrl ?? null,
        paid_at: null,
        created_at: now,
        updated_at: now,
      });
      if (error) throw error;
      return id;
    },
    onSuccess: invalidate,
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("generated_invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const markPendingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("generated_invoices")
        .update({ status: "pending", paid_at: null, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("generated_invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    items,
    isLoading,
    create: createMutation.mutateAsync,
    markPaid: markPaidMutation.mutateAsync,
    markPending: markPendingMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  };
}

/** Public fetch — no auth required (used by client portal) */
export async function fetchPublicInvoice(invoiceId: string): Promise<GeneratedInvoice | null> {
  try {
    const { data, error } = await supabase
      .from("generated_invoices")
      .select("*")
      .eq("id", invoiceId)
      .limit(1)
      .single();
    if (error || !data) return null;
    return rowToModel(data);
  } catch {
    return null;
  }
}
