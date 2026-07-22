import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session (also consumes ?code= from PKCE magic-link / OAuth redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, isAuthenticated: !!user };
}

/**
 * Redirect target for magic-link / OAuth.
 * Must be origin-only (no hash). Hash fragments break Supabase redirects and
 * conflict with this app's hash router; after session is established the app
 * navigates to `/#/invoices`.
 */
function authRedirectUrl() {
  return `${window.location.origin}/`;
}

export async function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirectUrl() },
  });
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: authRedirectUrl() },
  });
}

export async function signOut() {
  // Clears local session storage and notifies onAuthStateChange listeners.
  return supabase.auth.signOut();
}
