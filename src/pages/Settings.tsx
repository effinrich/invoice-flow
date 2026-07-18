import { Crown, LogOut, User } from "lucide-react";
import { useAppContext } from "../layouts/RootLayout";

export default function Settings() {
  const { user, plan, isPro, onUpgrade, onLogout } = useAppContext();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan and account details.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium text-foreground">{user?.email ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Current plan</div>
              <div className="font-medium text-foreground capitalize">{plan}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Plan</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Upgrade for unlimited invoices, custom branding, and templates.
          </p>
          <div className="flex flex-wrap gap-2">
            {!isPro && (
              <button
                onClick={() => onUpgrade("pro")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro — $12/mo
              </button>
            )}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
