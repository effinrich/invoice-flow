# InvoiceFlow

> **Create professional invoices in under 60 seconds. Get paid faster.**

---

## The Business Idea

Freelancers and small agencies lose hours every week on administrative work — and invoicing is one of the biggest culprits. Existing tools (QuickBooks, FreshBooks, Wave) are either bloated with features nobody uses, expensive, or designed for accountants rather than creatives.

**InvoiceFlow** is a focused, beautifully designed invoicing tool built for the modern freelancer. It does one thing exceptionally well: turns your project details into a polished, professional invoice in under 60 seconds — no learning curve, no accounting degree required.

The core insight: **most freelancers don't need accounting software. They need a fast, beautiful way to bill clients and get paid.** InvoiceFlow is exactly that.

---

## The Problem

| Pain Point                            | How Freelancers Deal With It Today          |
| ------------------------------------- | ------------------------------------------- |
| Creating invoices is slow and tedious | Word/Google Docs templates — unprofessional |
| Accounting tools are overwhelming     | Abandon them after 2 weeks                  |
| PDF invoice design looks amateur      | Clients question legitimacy                 |
| No live preview while editing         | Send → notice mistake → resend              |
| Multi-currency complexity             | Manual conversion, errors                   |
| High cost for occasional invoicers    | Paying $20–40/mo for tools they barely use  |

---

## The Solution

InvoiceFlow is a **freemium SaaS** that lives entirely in the browser. No installation. No onboarding flow. Open the app, fill in 6 fields, and download a pixel-perfect PDF invoice in under a minute.

### Core Experience

```
Open app → Fill in client + line items → See live preview → Download PDF → Send to client
          ↑                                                                        |
          └──────────────────────────────────────────────────────────────────────-┘
                                    Get paid
```

### What Makes It Different

- **Live preview**: The invoice renders in real time as you type — no "generate" button, no delay
- **Zero friction**: No account required to start. Create your first invoice immediately
- **Design quality**: Templates that look like they were made by a professional designer
- **Speed**: 60 seconds from open to download, not 20 minutes
- **Focused**: Does invoicing exceptionally, not 200 accounting tasks poorly

---

## Business Model

InvoiceFlow runs on a **freemium subscription model** — the fastest path to real revenue because it removes all barriers to the first experience, then converts power users naturally.

### Pricing Tiers

| Feature                    | Free | Pro ($12/mo) | Agency ($29/mo) |
| -------------------------- | :--: | :----------: | :-------------: |
| Invoices per month         |  5   |  Unlimited   |    Unlimited    |
| PDF export                 |  ✓   |      ✓       |        ✓        |
| Templates                  |  1   |     10+      |       10+       |
| Custom logo & brand colors |  ✗   |      ✓       |        ✓        |
| Payment status tracking    |  ✗   |      ✓       |        ✓        |
| Client management          |  ✗   |      ✓       |        ✓        |
| Team members               |  1   |      1       |    Up to 10     |
| White-label option         |  ✗   |      ✗       |        ✓        |
| API access                 |  ✗   |      ✗       |        ✓        |
| Priority support           |  ✗   |      ✓       |        ✓        |

### Why This Pricing Works

- **Free tier** is genuinely useful (5 invoices/month covers most occasional freelancers)
- **Pro at $12/mo** is an easy yes for anyone invoicing regularly — it pays for itself with a single client
- **Agency at $29/mo** targets studios and small teams who need collaboration and white-labeling
- **Stripe Checkout** handles all payment processing — no PCI compliance burden on the app
- **No trial period needed** — the free tier IS the trial

### Revenue Projections (Conservative)

```
Month 3:   500 free users →  25 Pro conversions (5%)  = $300 MRR
Month 6: 2,000 free users → 120 Pro conversions (6%)  = $1,440 MRR
Month 12: 8,000 free users → 500 Pro (6.25%) + 30 Agency (0.4%) = $6,000 + $870 = $6,870 MRR
```

**Key lever**: Every freelancer who uses InvoiceFlow becomes a distribution channel — their clients see "Generated with InvoiceFlow" on every invoice.

---

## Revenue Logic (Unit Economics)

| Metric                          | Value                                 |
| ------------------------------- | ------------------------------------- |
| Average Revenue Per User (ARPU) | ~$14/mo (blended Pro + Agency)        |
| Customer Acquisition Cost (CAC) | ~$8 (primarily organic/word-of-mouth) |
| Lifetime Value (LTV)            | ~$168 (12-month average retention)    |
| LTV:CAC Ratio                   | **21:1**                              |
| Gross Margin                    | ~92% (no COGS beyond hosting)         |
| Payback Period                  | < 1 month                             |

The LTV:CAC ratio is exceptional because:

1. Organic distribution through invoice footers (free advertising at scale)
2. Low churn — invoicing is a recurring need, not a one-time task
3. Switching cost grows as users build their client list and invoice history

---

## The Web App

### Architecture

```
Frontend (React + Vite + TypeScript)
├── Landing Page          — Marketing, pricing, social proof
├── Invoice Creator       — The core product experience
│   ├── Form Panel        — Left: all inputs
│   └── Preview Panel     — Right: live invoice render
└── Authentication        — Blink managed auth (email/password + social)

Backend Services
├── Blink Auth            — User accounts, JWT tokens, session management
├── Blink DB (SQLite)     — Subscriptions, user data
└── Stripe                — Payment processing, subscription billing
```

### Key Pages

#### 1. Landing Page

The conversion engine. Structured to answer every objection a freelancer might have:

- **Hero** — Headline + app mockup showing the actual product
- **Features** — 6 specific benefits with icons (not vague marketing)
- **Testimonials** — Social proof from three distinct user archetypes
- **Pricing** — Transparent, no hidden fees, one-click upgrade
- **Final CTA** — Repeat the core value prop one more time

Auth-aware navbar: signed-in users see their plan badge and go directly to the creator. Signed-out users see the "Create Invoice Free" CTA.

#### 2. Invoice Creator

The core product. Split-panel layout:

**Left panel — Form:**

- Invoice number + dates (auto-populated)
- Currency selector (8 currencies: USD, EUR, GBP, CAD, AUD, JPY, INR, BRL)
- From (sender) details
- To (client) details
- Line items table (add/remove rows, quantity × rate auto-calculates)
- Tax rate + discount fields
- Notes / payment terms
- Branding (logo initials + accent color) — **Pro only, with inline upgrade prompt**

**Right panel — Live Preview:**

- Renders every keystroke instantly
- Shows the exact invoice the client will receive
- Accent color theming applied in real-time
- Print/PDF-ready layout
- Pro upsell banner for free users

**Header bar:**

- Back to landing, plan badge, mobile preview toggle
- Download PDF button — **locked for free users**, triggers upgrade modal

#### 3. Upgrade Modal

Opens when a free user hits any Pro feature. Shows:

- Plan name + price
- Full feature list
- Direct link to Stripe Checkout (opens in new tab, pre-fills user email)
- Promo code field hint

### Data Flow

```
User signs up
    ↓
Creates invoices (free tier: up to 5/month)
    ↓
Hits a Pro feature (PDF, branding, unlimited)
    ↓
Upgrade modal → Stripe Checkout (new tab)
    ↓
Stripe processes payment
    ↓
Redirect back with ?upgraded=pro
    ↓
App writes subscription record to DB
    ↓
UI unlocks Pro features immediately
    ↓
On every subsequent visit: useSubscription hook reads DB → features stay unlocked
```

### Database Schema

```sql
-- Managed by Blink Auth
users (
  id, email, email_verified,
  display_name, avatar_url,
  role, metadata,
  created_at, updated_at, last_sign_in
)

-- Custom: subscription state per user
subscriptions (
  id, user_id,
  stripe_customer_id, stripe_subscription_id,
  plan,                 -- 'free' | 'pro' | 'agency'
  status,               -- 'active' | 'trialing' | 'canceled'
  current_period_end,
  cancel_at_period_end,
  created_at, updated_at
)
```

### Tech Stack

| Layer         | Technology                | Why                                   |
| ------------- | ------------------------- | ------------------------------------- |
| Framework     | React 18 + Vite           | Fast DX, instant HMR                  |
| Language      | TypeScript                | Type safety across invoice data model |
| Styling       | Tailwind CSS              | Utility-first, no CSS bloat           |
| UI Components | @blinkdotnew/ui           | Production-grade SaaS components      |
| State         | React useState + useQuery | Simple, no over-engineering           |
| Auth          | Blink SDK (managed)       | Zero-config user accounts             |
| Database      | Blink DB (SQLite)         | Instant CRUD, no setup                |
| Payments      | Stripe                    | Industry standard, global coverage    |
| Fonts         | Space Grotesk + DM Sans   | Premium, modern, readable             |
| Icons         | Lucide React              | Consistent, lightweight               |
| Animations    | Framer Motion             | Smooth, accessible transitions        |
| Hosting       | Blink / S3                | Global CDN, instant deploys           |

---

## Competitive Positioning

| Tool             | Price               | Target                           | Weakness vs InvoiceFlow              |
| ---------------- | ------------------- | -------------------------------- | ------------------------------------ |
| QuickBooks       | $30–100/mo          | SMB accountants                  | Overwhelming, not for freelancers    |
| FreshBooks       | $17–55/mo           | Small business                   | Expensive, feature-bloated           |
| Wave             | Free (payments fee) | Budget-conscious                 | Ugly UI, slow, ad-supported          |
| Invoice Ninja    | Free–$12/mo         | Tech-savvy freelancers           | Complex setup, dated design          |
| PayPal Invoicing | Free                | Existing PayPal users            | Locked to PayPal ecosystem           |
| **InvoiceFlow**  | **$0–29/mo**        | **Design-conscious freelancers** | **Best UX, fastest, most beautiful** |

**Positioning statement:**

> InvoiceFlow is the only invoicing tool that respects a freelancer's time AND taste — built for people who care about how their brand looks to clients.

---

## Growth Strategy

### Phase 1 — Organic (Months 1–6)

- Invoice footer branding ("Generated with InvoiceFlow") on every PDF
- Each invoice sent is a free impression to a potential customer (the client)
- Post on design communities: Dribbble, Behance, Designer News, IndieHackers
- SEO: "free invoice generator", "invoice template freelancer", "professional invoice maker"

### Phase 2 — Content (Months 6–12)

- Blog: "How to write an invoice that gets paid faster"
- Template gallery: downloadable invoice templates (SEO magnet)
- YouTube: freelance business tutorials featuring InvoiceFlow

### Phase 3 — Integrations (Month 12+)

- Stripe Payment Links on invoices (clients pay directly in the invoice)
- Notion, Airtable, Google Sheets export
- Zapier / Make integration
- Xero / QuickBooks sync for users who need full accounting

---

## Why This Will Work

1. **The problem is universal** — every freelancer invoices. Every single one.
2. **The bar is low** — current tools are genuinely painful. A better UX wins market share.
3. **Distribution is built-in** — every invoice is a marketing touchpoint.
4. **Revenue is fast** — no enterprise sales cycle. Swipe card → instant upgrade.
5. **Margins are exceptional** — 92%+ gross margin on a SaaS with no COGS.
6. **The MVP is the product** — no need for a v2 before charging. The core loop is complete.

---

## Current Status

- ✅ Full product built (landing page + invoice creator)
- ✅ Stripe integrated (live mode, Pro + Agency products)
- ✅ Blink Auth integrated (user accounts, persistent sessions)
- ✅ Subscription DB (per-user plan tracking)
- ✅ Feature gating (PDF export, branding locked to Pro)
- ✅ Upgrade flow (modal → Stripe Checkout → success redirect)
- ✅ Mobile responsive
- 🔲 Stripe webhook handler (production hardening)
- 🔲 Invoice history (save past invoices to DB)
- 🔲 Client address book
- 🔲 Email invoices directly to clients
- 🔲 Payment link generation

---

_Built with InvoiceFlow — because getting paid should be the easy part._
