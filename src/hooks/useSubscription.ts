import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export type Plan = "free" | "pro" | "agency";

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: Plan;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionState {
  subscription: Subscription | null;
  plan: Plan;
  isLoading: boolean;
  isPro: boolean;
  isAgency: boolean;
  refetch: () => Promise<void>;
}

function rowToSub(row: Record<string, any>): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    plan: (row.plan as Plan) ?? "free",
    status: row.status ?? "inactive",
    currentPeriodEnd: row.current_period_end ?? null,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useSubscription(userId: string | null): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setSubscription(data ? rowToSub(data) : null);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    fetchSubscription();
  }, [fetchSubscription]);

  const plan: Plan = subscription?.plan ?? "free";
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  return {
    subscription,
    plan: isActive ? plan : "free",
    isLoading,
    isPro: isActive && (plan === "pro" || plan === "agency"),
    isAgency: isActive && plan === "agency",
    refetch: fetchSubscription,
  };
}

// Stripe price IDs
export const STRIPE_CONFIG = {
  pro: {
    priceId: "price_1TXGcZ9TUspFE5VHBffUP6kr",
    productId: "prod_UWJExLz8eN79RS",
    amount: 12,
  },
  agency: {
    priceId: "price_1TXGcg9TUspFE5VH5VATjm7K",
    productId: "prod_UWJEzfyTrzVQZU",
    amount: 29,
  },
};

/** Record a subscription locally after Stripe redirects back */
export async function recordSubscription(
  userId: string,
  plan: Plan,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
): Promise<void> {
  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        stripe_customer_id: stripeCustomerId ?? existing.stripe_customer_id,
        stripe_subscription_id: stripeSubscriptionId ?? existing.stripe_subscription_id,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        updated_at: now,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert({
      user_id: userId,
      plan,
      status: "active",
      stripe_customer_id: stripeCustomerId ?? null,
      stripe_subscription_id: stripeSubscriptionId ?? null,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      created_at: now,
      updated_at: now,
    });
  }
}
