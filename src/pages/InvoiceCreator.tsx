import { useState, useRef } from 'react'
import InvoiceForm from '../components/invoice/InvoiceForm'
import InvoicePreview from '../components/invoice/InvoicePreview'
import { type InvoiceData, defaultInvoice } from '../types/invoice'
import {
  ArrowLeft, Printer, Download, Eye, EyeOff,
  FileText, Sparkles, Crown, CheckCircle2, Lock, Loader2, RotateCcw
} from 'lucide-react'
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
  seedInvoice?: InvoiceData | null
}

export default function InvoiceCreator({ onBack, user, isPro, plan, onUpgrade, subLoading, seedInvoice }: InvoiceCreatorProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(seedInvoice ?? defaultInvoice)
  const [showPreview, setShowPreview] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handleLoginToUpgrade = () => {
    blink.auth.login(window.location.href + '?upgrade=1')
  }

  // Pro: generate a real PDF file, no browser dialog
  const handleProDownload = async () => {
    if (!printRef.current) return
    setGeneratingPdf(true)

    const toastId = 'pdf-gen'
    toast.loading('Generating PDF…', { id: toastId } as Parameters<typeof toast.loading>[1])

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      // Render the preview at 2× for retina sharpness
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: printRef.current.scrollWidth,
        windowHeight: printRef.current.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.97)
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * pageW) / canvas.width

      let heightLeft = imgH
      let yPosition = 0

      // First page
      pdf.addImage(imgData, 'JPEG', 0, yPosition, imgW, imgH)
      heightLeft -= pageH

      // Additional pages for tall invoices
      while (heightLeft > 0) {
        yPosition = heightLeft - imgH
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, yPosition, imgW, imgH)
        heightLeft -= pageH
      }

      const filename = `invoice-${invoice.invoiceNumber || 'draft'}.pdf`
      pdf.save(filename)

      toast.dismiss(toastId)
      toast.success('PDF downloaded!', {
        description: `Saved as ${filename}`,
      })
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.dismiss(toastId)
      toast.error('PDF generation failed', {
        description: 'Falling back to print dialog.',
      })
      window.print()
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Free: print dialog with "Save as PDF" tip
  const handleFreePrint = () => {
    toast.success('Opening print dialog…', {
      description: 'Choose "Save as PDF" in the print dialog to download.',
    })
    setTimeout(() => window.print(), 300)
  }

  const handleAction = () => {
    if (isPro) {
      handleProDownload()
    } else {
      handleFreePrint()
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf9f7', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-4 md:px-6 h-16 flex items-center justify-between gap-4 no-print"
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
          <div className="hidden md:flex items-center gap-2">
            <span className="hidden md:block text-sm" style={{ color: '#9c8572' }}>
              {seedInvoice ? (
                <span className="flex items-center gap-1.5">
                  <RotateCcw size={12} />
                  From recurring template
                </span>
              ) : 'New Invoice'}
            </span>
          </div>
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

          {/* Primary action */}
          <button
            onClick={handleAction}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: 'hsl(16 95% 52%)',
              boxShadow: '0 4px 14px hsl(16 95% 52% / 0.35)',
              minWidth: isPro ? 148 : 128,
            }}
          >
            {generatingPdf ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span className="hidden sm:inline">Generating…</span>
              </>
            ) : isPro ? (
              <>
                <Download size={15} />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </>
            ) : (
              <>
                <Printer size={15} />
                <span className="hidden sm:inline">Print Invoice</span>
                <span className="sm:hidden">Print</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form panel */}
        <div
          className={`${showPreview ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[480px] lg:w-[520px] xl:w-[560px] border-r overflow-y-auto no-print`}
          style={{ borderColor: '#e8e0d8', background: '#fff' }}
        >
          <InvoiceForm invoice={invoice} onChange={setInvoice} isPro={isPro} onUpgrade={onUpgrade} />
        </div>

        {/* Preview panel */}
        <div
          className={`${showPreview ? 'flex' : 'hidden md:flex'} flex-col flex-1 overflow-y-auto items-center p-6 md:p-10 print:w-full print:max-w-none print:p-0 print:items-start`}
          style={{ background: '#f0ece8' }}
        >
          {/* The invoice — captured by html2canvas for Pro PDF */}
          <div ref={printRef} className="w-full max-w-2xl print:max-w-none print:w-full">
            <InvoicePreview invoice={invoice} isPro={isPro} />
          </div>

          {/* Free user info card */}
          {!subLoading && !isPro && (
            <div
              className="no-print mt-6 w-full max-w-2xl rounded-2xl border overflow-hidden"
              style={{ background: '#fff', borderColor: '#e8e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: '#f0ece8' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9c8572' }}>What you can do now (free)</p>
                <div className="space-y-2">
                  {[
                    'Edit all invoice fields with live preview',
                    'Print invoice → "Save as PDF" in browser dialog',
                    'Share the printed PDF with your client',
                    'Up to 5 invoices per month',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#3d2e22' }}>
                      <CheckCircle2 size={14} style={{ color: 'hsl(151 55% 38%)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 pt-4 pb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9c8572' }}>Unlock with Pro — $12/mo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {[
                    'Direct PDF download — no print dialog',
                    'Remove InvoiceFlow watermark',
                    'Custom logo & brand color',
                    'Unlimited invoices',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm" style={{ color: '#6b5c4c' }}>
                      <Lock size={12} style={{ color: 'hsl(16 95% 52%)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => user ? onUpgrade('pro') : handleLoginToUpgrade()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: 'hsl(16 95% 52%)',
                    boxShadow: '0 4px 14px hsl(16 95% 52% / 0.3)',
                  }}
                >
                  <Sparkles size={14} />
                  Upgrade to Pro
                  <span className="opacity-70 font-normal text-xs">· cancel anytime</span>
                </button>
              </div>
            </div>
          )}

          {/* Pro hint */}
          {!subLoading && isPro && (
            <p className="no-print mt-4 text-xs text-center" style={{ color: '#c8b8a8' }}>
              PDF is generated directly — no print dialog.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
