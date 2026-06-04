import { useState } from 'react'
import {
  ArrowRight, CheckCircle2, Zap, FileText, Download,
  Star, ChevronRight, Sparkles, Clock, Shield, Globe,
  BarChart3, Users, X, LogIn, LogOut, RotateCcw
} from 'lucide-react'
import type { User } from '@blinkdotnew/sdk'
import type { Plan } from '../hooks/useSubscription'

interface LandingPageProps {
  onGetStarted: () => void
  onGoToRecurring: () => void
  user: User | null
  isPro: boolean
  plan: Plan
  onUpgrade: (plan?: 'pro' | 'agency') => void
  onLogin: () => void
  onLogout: () => void
}

const features = [
  { icon: Zap, title: 'Create in 60 seconds', desc: 'Intuitive form with live preview. Fill once, send immediately.', color: 'bg-orange-50 text-orange-500' },
  { icon: FileText, title: 'Professional templates', desc: 'Clean, modern invoice designs that impress clients on first look.', color: 'bg-amber-50 text-amber-500' },
  { icon: Download, title: 'PDF export', desc: 'Download pixel-perfect PDFs ready to send directly to clients.', color: 'bg-red-50 text-red-500' },
  { icon: BarChart3, title: 'Auto calculations', desc: 'Subtotals, taxes, discounts — calculated instantly as you type.', color: 'bg-yellow-50 text-yellow-600' },
  { icon: Shield, title: 'Your brand, front and center', desc: 'Add your logo, custom colors, and payment terms effortlessly.', color: 'bg-orange-50 text-orange-600' },
  { icon: Globe, title: 'Multi-currency support', desc: 'Invoice clients worldwide in any currency with proper formatting.', color: 'bg-amber-50 text-amber-600' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'Freelance Designer', avatar: 'SC', quote: 'I used to spend 30 minutes on every invoice. Now it takes me under 2 minutes. Game changer.', stars: 5 },
  { name: 'Marcus Williams', role: 'Web Developer', avatar: 'MW', quote: 'My clients actually compliment my invoices now. The templates are so clean and professional.', stars: 5 },
  { name: 'Priya Nair', role: 'Marketing Consultant', avatar: 'PN', quote: "Finally, an invoicing tool that doesn't feel like it was built in 2005. The UX is exceptional.", stars: 5 },
]

export default function LandingPage({ onGetStarted, onGoToRecurring, user, isPro, plan, onUpgrade, onLogin, onLogout }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const plans = [
    {
      name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for getting started',
      features: ['5 invoices per month', 'PDF download', '1 template', 'Basic customization'],
      missing: ['Custom branding', 'Unlimited invoices', 'Payment tracking', 'Priority support'],
      cta: 'Start Free', highlight: false, planKey: 'free' as const,
    },
    {
      name: 'Pro', price: '$12', period: 'per month', desc: 'For serious freelancers',
      features: ['Unlimited invoices', 'PDF + PNG export', '10+ premium templates', 'Custom logo & branding', 'Payment tracking', 'Client management', 'Priority support'],
      missing: [],
      cta: (isPro && plan === 'pro') ? '✓ Current plan' : 'Upgrade to Pro',
      highlight: true, planKey: 'pro' as const,
    },
    {
      name: 'Agency', price: '$29', period: 'per month', desc: 'For teams and agencies',
      features: ['Everything in Pro', 'Up to 10 team members', 'White-label option', 'API access', 'Dedicated account manager', 'Custom integrations'],
      missing: [],
      cta: plan === 'agency' ? '✓ Current plan' : 'Get Agency',
      highlight: false, planKey: 'agency' as const,
    },
  ]

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", background: '#FFFFFF' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: '#f0ece8' }}>
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(16 95% 52%)' }}>
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#1a1208' }}>
              Invoice<span style={{ color: 'hsl(16 95% 52%)' }}>Flow</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium" style={{ color: '#6b5c4c' }}>Features</a>
            <a href="#pricing" className="text-sm font-medium" style={{ color: '#6b5c4c' }}>Pricing</a>
            <a href="#testimonials" className="text-sm font-medium" style={{ color: '#6b5c4c' }}>Reviews</a>
            {user && (
              <button
                onClick={onGoToRecurring}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: '#6b5c4c' }}
              >
                <RotateCcw size={13} />Recurring
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {!isPro && (
                  <button onClick={() => onUpgrade('pro')} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:bg-orange-50" style={{ color: 'hsl(16 95% 52%)', borderColor: 'hsl(16 95% 52%)' }}>
                    <Sparkles size={13} />Upgrade to Pro
                  </button>
                )}
                {isPro && (
                  <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 35%)' }}>
                    {plan === 'agency' ? '⚡ Agency' : '⭐ Pro'}
                  </span>
                )}
                <button onClick={onGetStarted} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ background: 'hsl(16 95% 52%)' }}>
                  Open Creator <ArrowRight size={15} />
                </button>
                <button onClick={onLogout} className="hidden md:flex p-2 rounded-lg" style={{ color: '#9c8572' }} title="Sign out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={onLogin} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ color: '#6b5c4c' }}>
                  <LogIn size={15} />Sign in
                </button>
                <button className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 4px 14px hsl(16 95% 52% / 0.35)' }} onClick={onGetStarted}>
                  Create Invoice Free <ArrowRight size={15} />
                </button>
              </>
            )}
            <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: '#6b5c4c' }}>
              {mobileMenuOpen ? <X size={20} /> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4" style={{ borderColor: '#f0ece8' }}>
            <a href="#features" className="text-sm font-medium py-2" style={{ color: '#6b5c4c' }} onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-sm font-medium py-2" style={{ color: '#6b5c4c' }} onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#testimonials" className="text-sm font-medium py-2" style={{ color: '#6b5c4c' }} onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <button className="w-full py-3 rounded-lg text-sm font-semibold text-white" style={{ background: 'hsl(16 95% 52%)' }} onClick={onGetStarted}>
              {user ? 'Open Creator' : 'Create Invoice Free'}
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(16 95% 52%), transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(180deg, hsl(16 95% 97%) 0%, transparent 60%)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border" style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 35%)', borderColor: 'hsl(16 60% 88%)' }}>
            <Sparkles size={12} />Trusted by 12,000+ freelancers worldwide
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6" style={{ color: '#1a1208' }}>
            Invoice clients like{' '}
            <span className="relative inline-block">
              <span style={{ color: 'hsl(16 95% 52%)' }}>a pro</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="hsl(16 95% 52%)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{' '}in seconds
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#6b5c4c' }}>
            Stop wasting time on invoicing. Create beautiful, professional invoices in under 60 seconds and get paid faster — no accounting software required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 8px 30px hsl(16 95% 52% / 0.4)' }} onClick={onGetStarted}>
              Create Your First Invoice <ArrowRight size={18} />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border-2 transition-all hover:bg-orange-50 active:scale-[0.98]" style={{ color: 'hsl(16 95% 52%)', borderColor: 'hsl(16 95% 52%)' }} onClick={() => onUpgrade('pro')}>
              See Pro features <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#9c8572' }}>
            {[{ icon: CheckCircle2, text: 'No credit card required' }, { icon: Clock, text: 'Ready in 60 seconds' }, { icon: Users, text: '12,000+ freelancers' }].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5"><Icon size={14} style={{ color: 'hsl(16 95% 52%)' }} />{text}</span>
            ))}
          </div>
        </div>

        {/* App mockup */}
        <div className="relative mt-20 max-w-4xl mx-auto">
          <div className="rounded-2xl border overflow-hidden" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.12)', borderColor: '#e8e0d8' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: '#f8f5f2', borderColor: '#e8e0d8' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff6058' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <div className="flex-1 mx-4 px-3 py-1 rounded text-xs text-center" style={{ background: '#ede8e3', color: '#9c8572' }}>app.invoiceflow.io/create</div>
            </div>
            <div className="grid grid-cols-2" style={{ background: '#faf9f7', minHeight: 340 }}>
              <div className="p-6 border-r" style={{ borderColor: '#e8e0d8' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9c8572' }}>Invoice Details</p>
                {[{ label: 'Client Name', value: 'Acme Corporation' }, { label: 'Invoice #', value: 'INV-2024-001' }, { label: 'Due Date', value: 'Dec 31, 2024' }].map(({ label, value }) => (
                  <div key={label} className="mb-3">
                    <p className="text-xs mb-1" style={{ color: '#9c8572' }}>{label}</p>
                    <div className="px-3 py-2 rounded-lg text-sm font-medium border" style={{ background: '#fff', borderColor: '#e8e0d8', color: '#1a1208' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div><div className="text-2xl font-bold" style={{ color: '#1a1208' }}>INVOICE</div><div className="text-xs" style={{ color: '#9c8572' }}>#INV-2024-001</div></div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: 'hsl(16 95% 52%)' }}>IF</div>
                </div>
                <div className="space-y-1 text-xs border-t pt-3 mt-4" style={{ borderColor: '#e8e0d8' }}>
                  <div className="flex justify-between" style={{ color: '#6b5c4c' }}><span>Website Design</span><span>$3,500</span></div>
                  <div className="flex justify-between" style={{ color: '#6b5c4c' }}><span>Brand Identity</span><span>$1,200</span></div>
                  <div className="flex justify-between font-bold text-sm pt-2 border-t mt-2" style={{ borderColor: '#e8e0d8', color: '#1a1208' }}>
                    <span>Total</span><span style={{ color: 'hsl(16 95% 52%)' }}>$4,700</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 top-16 px-4 py-3 rounded-2xl hidden md:flex items-center gap-3" style={{ background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid #f0ece8' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'hsl(151 55% 93%)' }}>
              <CheckCircle2 size={16} style={{ color: 'hsl(151 55% 35%)' }} />
            </div>
            <div><p className="text-xs font-bold" style={{ color: '#1a1208' }}>Invoice sent!</p><p className="text-xs" style={{ color: '#9c8572' }}>Just now · $4,700</p></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" style={{ background: '#faf9f7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4 border" style={{ background: 'hsl(16 95% 96%)', color: 'hsl(16 80% 35%)', borderColor: 'hsl(16 60% 88%)' }}>Everything you need</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1a1208' }}>Built for freelancers,<br />designed to impress</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#6b5c4c' }}>Every feature you need to create, send, and get paid — nothing you don't.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl border bg-white" style={{ borderColor: '#e8e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}><Icon size={20} /></div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1a1208' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b5c4c' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1208' }}>Loved by freelancers</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={18} className="fill-current" style={{ color: 'hsl(35 90% 55%)' }} />))}
            </div>
            <p className="text-sm" style={{ color: '#9c8572' }}>4.9/5 from 1,200+ reviews</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, quote, stars }) => (
              <div key={name} className="p-6 rounded-2xl border" style={{ borderColor: '#e8e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: stars }).map((_, i) => (<Star key={i} size={14} className="fill-current" style={{ color: 'hsl(35 90% 55%)' }} />))}</div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#3d2e22' }}>"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(16 95% 52%)' }}>{avatar}</div>
                  <div><p className="text-sm font-bold" style={{ color: '#1a1208' }}>{name}</p><p className="text-xs" style={{ color: '#9c8572' }}>{role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: '#faf9f7' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1a1208' }}>Simple, honest pricing</h2>
            <p className="text-lg" style={{ color: '#6b5c4c' }}>Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, period, desc, features: planFeatures, missing, cta, highlight }) => (
              <div
                key={name}
                className="p-8 rounded-2xl border relative"
                style={{
                  borderColor: highlight ? 'hsl(16 95% 52%)' : '#e8e0d8',
                  boxShadow: highlight ? '0 20px 60px hsl(16 95% 52% / 0.15), 0 0 0 2px hsl(16 95% 52% / 0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
                  transform: highlight ? 'scale(1.04)' : 'scale(1)',
                  background: '#fff',
                }}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'hsl(16 95% 52%)' }}>Most popular</div>
                  </div>
                )}
                <p className="text-sm font-semibold mb-1" style={{ color: highlight ? 'hsl(16 95% 52%)' : '#9c8572' }}>{name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold" style={{ color: '#1a1208' }}>{price}</span>
                  <span className="text-sm mb-1" style={{ color: '#9c8572' }}>/{period}</span>
                </div>
                <p className="text-sm mb-6" style={{ color: '#9c8572' }}>{desc}</p>
                <button
                  disabled={!!(name === 'Pro' && isPro && plan === 'pro') || !!(name === 'Agency' && plan === 'agency')}
                  className="w-full py-3 rounded-xl text-sm font-bold mb-6 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-default"
                  style={{
                    background: highlight ? 'hsl(16 95% 52%)' : 'transparent',
                    color: highlight ? '#fff' : 'hsl(16 95% 52%)',
                    border: highlight ? 'none' : '2px solid hsl(16 95% 52%)',
                    boxShadow: highlight ? '0 4px 16px hsl(16 95% 52% / 0.3)' : 'none',
                  }}
                  onClick={() => {
                    if (name === 'Free') { onGetStarted(); return }
                    if ((name === 'Pro' && isPro && plan === 'pro') || (name === 'Agency' && plan === 'agency')) return
                    onUpgrade(name.toLowerCase() as 'pro' | 'agency')
                  }}
                >
                  {cta}
                </button>
                <div className="space-y-2.5">
                  {planFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#3d2e22' }}>
                      <CheckCircle2 size={15} style={{ color: 'hsl(151 55% 35%)', flexShrink: 0 }} />{f}
                    </div>
                  ))}
                  {missing.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#bbb' }}>
                      <X size={15} style={{ flexShrink: 0 }} />{f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-5" style={{ color: '#1a1208' }}>Start invoicing like a pro</h2>
          <p className="text-lg mb-8" style={{ color: '#6b5c4c' }}>Join 12,000+ freelancers who get paid faster with InvoiceFlow. No setup. No credit card.</p>
          <button className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'hsl(16 95% 52%)', boxShadow: '0 10px 40px hsl(16 95% 52% / 0.4)' }} onClick={onGetStarted}>
            Create Your First Invoice <ArrowRight size={20} />
          </button>
          <p className="text-sm mt-4" style={{ color: '#9c8572' }}>Free forever · No credit card needed</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12" style={{ borderColor: '#f0ece8', background: '#faf9f7' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(16 95% 52%)' }}>
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-bold" style={{ color: '#1a1208' }}>Invoice<span style={{ color: 'hsl(16 95% 52%)' }}>Flow</span></span>
          </div>
          <p className="text-sm" style={{ color: '#9c8572' }}>© 2024 InvoiceFlow. Built for freelancers, by freelancers.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (<a key={link} href="#" className="text-sm hover:underline" style={{ color: '#9c8572' }}>{link}</a>))}
          </div>
        </div>
      </footer>
    </div>
  )
}
