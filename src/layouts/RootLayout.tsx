import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth, signOut } from "../hooks/useAuth";
import { useSubscription, recordSubscription } from "../hooks/useSubscription";
import { UpgradeModal } from "../components/UpgradeModal";
import { SignInModal } from "../components/SignInModal";
import { toast } from "@blinkdotnew/ui";
import type { Plan } from "../hooks/useSubscription";
import type { User } from "@supabase/supabase-js";

export interface AppContext {
  user: User | null;
  isPro: boolean;
  isAgency: boolean;
  plan: Plan;
  subLoading: boolean;
  onUpgrade: (p?: "pro" | "agency") => void;
  onLogin: () => void;
  onLogout: () => void;
}

const AppContextInstance = createContext<AppContext | null>(null);

export function useAppContext(): AppContext {
  const ctx = useContext(AppContextInstance);
  if (!ctx) throw new Error("useAppContext must be used within RootLayout");
  return ctx;
}

export function RootLayout() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<"pro" | "agency">("pro");
  const [signInOpen, setSignInOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  const { user, isLoading: authLoading } = useAuth();
  const {
    plan,
    isPro,
    isAgency,
    isLoading: subLoading,
    refetch,
  } = useSubscription(user?.id ?? null);

  // Handle post-Stripe-checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded") as "pro" | "agency" | null;

    if (upgraded && user && (upgraded === "pro" || upgraded === "agency")) {
      const handle = async () => {
        try {
          await recordSubscription(user.id, upgraded);
          await refetch();
          toast.success(`Welcome to ${upgraded === "pro" ? "Pro" : "Agency"}! 🎉`, {
            description: "Your subscription is now active. Enjoy all premium features.",
          });
          window.history.replaceState({}, "", window.location.pathname);
        } catch {
          toast.error("Could not confirm subscription. Please contact support.");
        }
      };
      handle();
    }

    if (params.get("upgrade") === "1" && user) {
      setUpgradePlan("pro");
      setUpgradeOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [user, refetch]);

  const handleOpenUpgrade = (p: "pro" | "agency" = "pro") => {
    setUpgradePlan(p);
    setUpgradeOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    // beforeLoad guards do not always re-run on context-only auth changes —
    // navigate out of the protected shell and invalidate so they re-check.
    await router.invalidate();
    await navigate({ to: "/" });
  };

  const context: AppContext = {
    user,
    isPro,
    isAgency,
    plan,
    subLoading,
    onUpgrade: handleOpenUpgrade,
    onLogin: () => setSignInOpen(true),
    onLogout: () => {
      void handleLogout();
    },
  };

  return (
    <AppContextInstance.Provider value={context}>
      <Outlet />
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        user={user}
        defaultPlan={upgradePlan}
        onLoginRequired={() => {
          setUpgradeOpen(false);
          setSignInOpen(true);
        }}
      />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </AppContextInstance.Provider>
  );
}
