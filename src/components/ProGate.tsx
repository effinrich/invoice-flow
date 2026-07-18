import { Lock, Sparkles } from "lucide-react";
import { blink } from "../blink/client";

interface ProGateProps {
  feature: string;
  description?: string;
  onUpgrade: () => void;
  children: React.ReactNode;
  isPro: boolean;
}

export function ProGate({ feature, description, onUpgrade, children, isPro }: ProGateProps) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none opacity-40 blur-sm">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl p-4 text-center bg-background/85">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[hsl(16_95%_96%)]">
          <Lock size={18} className="text-primary" />
        </div>
        <p className="text-sm font-bold mb-1 text-foreground">{feature}</p>
        {description && (
          <p className="text-xs mb-3 max-w-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-primary-foreground transition-all hover:opacity-90 bg-primary"
        >
          <Sparkles size={12} />
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

export function LoginToUpgrade(_props: { onLogin: () => void }) {
  return null; // handled inline via blink.auth.login()
}

export function loginForUpgrade() {
  blink.auth.login(window.location.href + "?upgrade=1");
}
