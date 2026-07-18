import { X, CheckCircle2, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { STRIPE_CONFIG } from "../hooks/useSubscription";
import { toast } from "@blinkdotnew/ui";
import type { User } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  defaultPlan?: "pro" | "agency";
  onLoginRequired: () => void;
}

const planDetails = {
  pro: {
    name: "Pro",
    price: "$12",
    period: "/month",
    color: "hsl(16 95% 52%)",
    badge: "Most Popular",
    features: [
      "Unlimited invoices",
      "PDF export (print-ready)",
      "10+ premium templates",
      "Custom logo & brand colors",
      "Payment status tracking",
      "Client management",
      "Priority email support",
    ],
  },
  agency: {
    name: "Agency",
    price: "$29",
    period: "/month",
    color: "hsl(16 75% 35%)",
    badge: "For Teams",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "White-label option",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA support",
    ],
  },
};

export function UpgradeModal({
  open,
  onClose,
  user,
  defaultPlan = "pro",
  onLoginRequired,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async (plan: "pro" | "agency") => {
    if (!user) {
      onLoginRequired();
      return;
    }

    setLoading(true);
    try {
      const config = STRIPE_CONFIG[plan];
      const origin = window.location.origin + window.location.pathname;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          priceId: config.priceId,
          userId: user.id,
          email: user.email || "",
          successUrl: `${origin}?upgraded=${plan}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: origin,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to create checkout session");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const plan = planDetails[defaultPlan];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden bg-card shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-[linear-gradient(135deg,hsl(16_95%_97%),hsl(16_95%_93%))]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
              <Sparkles size={11} />
              {plan.badge}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-foreground">Upgrade to {plan.name}</h2>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-foreground">{plan.price}</span>
            <span className="text-sm mb-1 text-muted-foreground">{plan.period}</span>
          </div>
        </div>

        {/* Features */}
        <div className="px-8 py-6">
          <p className="text-sm font-semibold mb-4 text-foreground">Everything you get:</p>
          <div className="space-y-3 mb-8">
            {plan.features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-foreground">
                <CheckCircle2 size={16} className="text-[hsl(151_55%_35%)] shrink-0" />
                {f}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => handleUpgrade(defaultPlan)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-primary-foreground mb-3 transition-all hover:opacity-90 active:scale-[0.98] bg-primary shadow-[0_8px_24px_hsl(16_95%_52%_/_0.35)]"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ExternalLink size={16} />}
            {user ? `Subscribe to ${plan.name}` : "Sign in to subscribe"}
          </button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground">
              You'll be redirected to sign in first, then to checkout.
            </p>
          )}

          {user && (
            <p className="text-center text-xs text-muted-foreground">
              You'll be redirected to Stripe checkout. Use promo code{" "}
              <span className="font-bold px-1 rounded bg-[hsl(16_95%_96%)] text-[hsl(16_80%_35%)]">
                VAJ4CH41
              </span>{" "}
              for 100% off your first month.
            </p>
          )}
        </div>

        {/* Switch plan */}
        {defaultPlan === "pro" && (
          <div className="px-8 pb-6 pt-0 border-t flex items-center justify-center border-border">
            <button
              onClick={() => handleUpgrade("agency")}
              className="mt-4 text-xs underline text-muted-foreground"
              disabled={loading}
            >
              View Agency plan ($29/mo) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
