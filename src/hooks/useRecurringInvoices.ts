import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { RecurringInvoice } from "../types/recurring";
import { getNextDueDate } from "../types/recurring";

const QK = "recurring-invoices";

function rowToModel(row: Record<string, unknown>): RecurringInvoice {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    clientName: row.client_name as string,
    clientEmail: (row.client_email as string) ?? "",
    clientAddress: (row.client_address as string) ?? "",
    fromName: (row.from_name as string) ?? "",
    fromEmail: (row.from_email as string) ?? "",
    fromAddress: (row.from_address as string) ?? "",
    lineItems: JSON.parse((row.line_items as string) || "[]"),
    currency: (row.currency as string) ?? "USD",
    taxRate: Number(row.tax_rate ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    notes: (row.notes as string) ?? "",
    accentColor: (row.accent_color as string) ?? "hsl(16 95% 52%)",
    logoText: (row.logo_text as string) ?? "YS",
    logoUrl: (row.logo_url as string) ?? null,
    frequency: row.frequency as RecurringInvoice["frequency"],
    status: row.status as RecurringInvoice["status"],
    startDate: row.start_date as string,
    nextDueDate: row.next_due_date as string,
    lastGeneratedAt: (row.last_generated_at as string) ?? null,
    invoiceCount: Number(row.invoice_count ?? 0),
    stripePaymentLinkUrl: (row.stripe_payment_link_url as string) ?? null,
    autoEmailEnabled: Boolean(row.auto_email_enabled ?? false),
    daysBefore: Number(row.days_before_due ?? 3),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function modelToRow(data: Partial<RecurringInvoice>) {
  const row: Record<string, unknown> = {};
  if (data.userId !== undefined) row.user_id = data.userId;
  if (data.clientName !== undefined) row.client_name = data.clientName;
  if (data.clientEmail !== undefined) row.client_email = data.clientEmail;
  if (data.clientAddress !== undefined) row.client_address = data.clientAddress;
  if (data.fromName !== undefined) row.from_name = data.fromName;
  if (data.fromEmail !== undefined) row.from_email = data.fromEmail;
  if (data.fromAddress !== undefined) row.from_address = data.fromAddress;
  if (data.lineItems !== undefined) row.line_items = JSON.stringify(data.lineItems);
  if (data.currency !== undefined) row.currency = data.currency;
  if (data.taxRate !== undefined) row.tax_rate = data.taxRate;
  if (data.discountAmount !== undefined) row.discount_amount = data.discountAmount;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.accentColor !== undefined) row.accent_color = data.accentColor;
  if (data.logoText !== undefined) row.logo_text = data.logoText;
  if (data.logoUrl !== undefined) row.logo_url = data.logoUrl;
  if (data.frequency !== undefined) row.frequency = data.frequency;
  if (data.status !== undefined) row.status = data.status;
  if (data.startDate !== undefined) row.start_date = data.startDate;
  if (data.nextDueDate !== undefined) row.next_due_date = data.nextDueDate;
  if (data.lastGeneratedAt !== undefined) row.last_generated_at = data.lastGeneratedAt;
  if (data.invoiceCount !== undefined) row.invoice_count = data.invoiceCount;
  if (data.stripePaymentLinkUrl !== undefined)
    row.stripe_payment_link_url = data.stripePaymentLinkUrl;
  if (data.autoEmailEnabled !== undefined) row.auto_email_enabled = data.autoEmailEnabled;
  if (data.daysBefore !== undefined) row.days_before_due = data.daysBefore;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

export function useRecurringInvoices(userId: string | null) {
  const qc = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QK, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("recurring_invoices")
        .select("*")
        .eq("user_id", userId)
        .order("next_due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(rowToModel);
    },
    enabled: !!userId,
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: [QK, userId] });
  }, [qc, userId]);

  const createMutation = useMutation({
    mutationFn: async (
      data: Omit<
        RecurringInvoice,
        "id" | "createdAt" | "updatedAt" | "invoiceCount" | "lastGeneratedAt"
      >,
    ) => {
      const now = new Date().toISOString();
      const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabase.from("recurring_invoices").insert({
        id,
        ...modelToRow({ ...data, invoiceCount: 0, lastGeneratedAt: null }),
        created_at: now,
        updated_at: now,
      });
      if (error) throw error;
      return id;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RecurringInvoice> & { id: string }) => {
      const row = modelToRow({ ...data, updatedAt: new Date().toISOString() });
      const { error } = await supabase.from("recurring_invoices").update(row).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recurring_invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: RecurringInvoice) => {
      const newStatus = item.status === "active" ? "paused" : "active";
      const { error } = await supabase
        .from("recurring_invoices")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Mark as generated — advances next_due_date and increments invoice_count
  const markGeneratedMutation = useMutation({
    mutationFn: async (item: RecurringInvoice) => {
      const now = new Date().toISOString();
      const nextDue = getNextDueDate(new Date(), item.frequency);
      const { error } = await supabase
        .from("recurring_invoices")
        .update({
          last_generated_at: now,
          next_due_date: nextDue.toISOString().split("T")[0],
          invoice_count: item.invoiceCount + 1,
          updated_at: now,
        })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    items,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    markGenerated: markGeneratedMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
