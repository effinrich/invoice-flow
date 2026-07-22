import { useEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useAppContext } from "./RootLayout";

/**
 * Optional layout for auth-gated route trees.
 * Prefer router `beforeLoad` guards (see router.tsx); this is a client-side fallback.
 * Uses Supabase session via AppContext — never Blink Auth.
 */
export function AuthedLayout() {
  const { user, subLoading } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!subLoading && !user) {
      void navigate({ to: "/" });
    }
  }, [user, subLoading, navigate]);

  if (subLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}
