import { Lock, Sparkles } from 'lucide-react'
import { blink } from '../blink/client'

interface ProGateProps {
  feature: string
  description?: string
  onUpgrade: () => void
  children: React.ReactNode
  isPro: boolean
}

export function ProGate({ feature, description, onUpgrade, children, isPro }: ProGateProps) {
  if (isPro) return <>{children}</>

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none opacity-40 blur-sm">{children}</div>

      {/* Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-xl p-4 text-center"
        style={{ background: 'rgba(250, 249, 247, 0.85)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ background: 'hsl(16 95% 96%)' }}
        >
          <Lock size={18} style={{ color: 'hsl(16 95% 52%)' }} />
        </div>
        <p className="text-sm font-bold mb-1" style={{ color: '#1a1208' }}>
          {feature}
        </p>
        {description && (
          <p className="text-xs mb-3 max-w-xs leading-relaxed" style={{ color: '#9c8572' }}>
            {description}
          </p>
        )}
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'hsl(16 95% 52%)' }}
        >
          <Sparkles size={12} />
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}

export function LoginToUpgrade({ onLogin }: { onLogin: () => void }) {
  return null // handled inline via blink.auth.login()
}

export function loginForUpgrade() {
  blink.auth.login(window.location.href + '?upgrade=1')
}
