import { useEffect, useState } from "react";
import { Building2, Crown, Loader2, LogOut, User } from "lucide-react";
import { toast } from "@blinkdotnew/ui";
import { useAppContext } from "../layouts/RootLayout";
import { useProfile } from "../hooks/useProfile";
import { BrandingSection } from "../components/recurring/BrandingSection";

export default function Settings() {
  const { user, plan, isPro, onUpgrade, onLogout } = useAppContext();
  const { profile, isLoading, save } = useProfile(user?.id ?? null);

  const [displayName, setDisplayName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [accentColor, setAccentColor] = useState("hsl(16 95% 52%)");
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setBusinessEmail(profile.businessEmail);
    setBusinessAddress(profile.businessAddress);
    setAccentColor(profile.accentColor);
    setLogoText(profile.logoText);
    setLogoUrl(profile.logoUrl);
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await save({
        displayName,
        businessEmail,
        businessAddress,
        accentColor,
        logoText: logoText || displayName.slice(0, 2).toUpperCase(),
        logoUrl,
      });
      toast.success("Business defaults saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and the business details used on new invoices.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Account</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">Sign-in email</div>
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
                type="button"
                onClick={() => onUpgrade("pro")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro — $12/mo
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Business defaults</h2>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          These details prefill the sender fields and branding on new invoices.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile…
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Display name
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name or Studio"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-[hsl(16_95%_52%_/_0.15)]"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Business email
                </span>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="billing@yourstudio.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-[hsl(16_95%_52%_/_0.15)]"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business address
              </span>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="123 Main St, City, Country"
                rows={3}
                className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-[hsl(16_95%_52%_/_0.15)]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Logo initials
              </span>
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value.slice(0, 3).toUpperCase())}
                placeholder={displayName.slice(0, 2).toUpperCase() || "YS"}
                maxLength={3}
                className="w-full max-w-[8rem] rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold tracking-wide text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-[hsl(16_95%_52%_/_0.15)]"
              />
            </label>

            <BrandingSection
              accentColor={accentColor}
              logoUrl={logoUrl}
              logoText={logoText || displayName.slice(0, 2).toUpperCase() || "YS"}
              onColorChange={setAccentColor}
              onLogoUrlChange={setLogoUrl}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save defaults
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
