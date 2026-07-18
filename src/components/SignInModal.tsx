import { useState, type FormEvent } from "react";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { signInWithEmail } from "../hooks/useAuth";

/**
 * SignInModal — passwordless email magic-link sign-in (Supabase OTP).
 * Wired to RootLayout's `onLogin`. Custom overlay (not the Blink UI Dialog) to
 * sidestep its React-19 type quirk, matching UpgradeModal's pattern.
 */
export function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const close = () => {
    setStatus("idle");
    setEmail("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const { error } = await signInWithEmail(email.trim());
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Could not send the link. Please try again.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-card shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-bold text-foreground">Sign in</h2>
          <button
            onClick={close}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {status === "sent" ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-primary" size={32} />
            <p className="text-sm font-semibold text-foreground">Check your inbox</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a magic link to <span className="font-medium text-foreground">{email}</span>.
              Click it to finish signing in.
            </p>
            <button
              onClick={close}
              className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Enter your email and we'll send you a magic link — no password needed.
            </p>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-[hsl(16_95%_52%_/_0.15)]"
              />
            </div>
            {status === "error" && <p className="mt-2 text-xs text-destructive">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Mail size={16} />
              )}
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
