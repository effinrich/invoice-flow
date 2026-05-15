import { useState, useRef } from 'react'
import InvoiceForm from '../components/invoice/InvoiceForm'
import InvoicePreview from '../components/invoice/InvoicePreview'
import { type InvoiceData, defaultInvoice } from '../types/invoice'
import { ArrowLeft, Download, Eye, EyeOff, FileText, Sparkles, Crown, Lock } from 'lucide-react'
import { toast } from '@blinkdotnew/ui'
import type { User } from '@blinkdotnew/sdk'
import type { Plan } from '../hooks/useSubscription'
import { blink } from '../blink/client'

interface InvoiceCreatorProps {
  onBack: () => void
  user: User | null
  isPro: boolean
  isAgency: boolean
  plan: Plan
  onUpgrade: (p?: 'pro' | 'agency') => void
  subLoading: boolean
}

export default function InvoiceCreator({ onBack, user, isPro, plan, onUpgrade, subLoading }: InvoiceCreatorProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(defaultInvoice)
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    if (!isPro && !subLoading) {
      // Show pro gate message
      toast.error('PDF export requires Pro', {
        description: 'Upgrade to Pro to download pixel-perfect PDFs.',
        action: { label: 'Upgrade', onClick: () => onUpgrade('pro') },
      })
      return
    }
    toast.success('Preparing PDF...', { description: 'Your invoice is being generated.' })
    setTimeout(() => window.print(), 300)
  }

  const handleLoginToUpgrade = () => {
    blink.auth.login(window.location.href + '?upgrade=1')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf9f7', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-4 md:px-6 h-16 flex items-center justify-between gap-4"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: '#e8e0d8' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-orange-50 transition-colors" style={{ color: '#6b5c4c' }} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(16 95% 52%)' }}>
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-bold text-base hidden sm:inline" style={{ color: '#1a1208' }}>
              Invoice<span style={{ color: 'hsl(16 95% 52%)' }}>Flow</span>
            </span>
          </div>
          <div className="hidden md:block h-5 border-l" style={{ borderColor: '#e8e0d8' }} />
          <span className="hidden md:block text-sm" style={{ color: '#9c8572' }}>New Invoice</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Plan badge */}
          {!subLoading && (
            isPro ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 35%)' }}>
                <Crown size={11} />{plan === 'agency' ? 'Agency' : 'Pro'}
              </span>
            ) : (
              <button
                onClick={() => user ? onUpgrade('pro') : handleLoginToUpgrade()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-orange-50"
                style={{ color: 'hsl(16 95% 52%)', borderColor: 'hsl(16 95% 52%)' }}
              >
                <Sparkles size={11} />Upgrade to Pro
              </button>
            )
          )}

          {/* Mobile preview toggle */}
          <button
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: 'hsl(16 95% 52%)',
              color: 'hsl(16 95% 52%)',
              background: showPreview ? 'hsl(16 95% 96%)' : 'transparent',
            }}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] relative"
            style={{
              background: isPro ? 'hsl(16 95% 52%)' : 'hsl(20 8% 65%)',
              boxShadow: isPro ? '0 4px 14px hsl(16 95% 52% / 0.35)' : 'none',
            }}
          >
            {!isPro && !subLoading && <Lock size={13} />}
            <Download size={15} />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form panel */}
        <div
          className={`${showPreview ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[480px] lg:w-[520px] xl:w-[560px] border-r overflow-y-auto`}
          style={{ borderColor: '#e8e0d8', background: '#fff' }}
        >
          <InvoiceForm invoice={invoice} onChange={setInvoice} isPro={isPro} onUpgrade={onUpgrade} />
        </div>

        {/* Preview panel */}
        <div
          className={`${showPreview ? 'flex' : 'hidden md:flex'} flex-1 overflow-y-auto items-start justify-center p-6 md:p-10`}
          style={{ background: '#f0ece8' }}
        >
          <div ref={printRef} className="w-full max-w-2xl print:max-w-none print:w-full">
            <InvoicePreview invoice={invoice} />
          </div>

          {/* Pro upsell banner below preview for free users */}
          {!isPro && !subLoading && (
            <div
              className="hidden md:flex mt-6 w-full max-w-2xl items-center justify-between px-5 py-4 rounded-2xl border"
              style={{ background: '#fff', borderColor: 'hsl(16 60% 88%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'hsl(16 95% 96%)' }}>
                  <Crown size={18} style={{ color: 'hsl(16 95% 52%)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a1208' }}>Unlock PDF export & custom branding</p>
                  <p className="text-xs" style={{ color: '#9c8572' }}>Upgrade to Pro for $12/month — cancel anytime</p>
                </div>
              </div>
              <button
                onClick={() => user ? onUpgrade('pro') : handleLoginToUpgrade()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white whitespace-nowrap"
                style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 4px 12px hsl(16 95% 52% / 0.3)' }}
              >
                <Sparkles size={13} />Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
