# InvoiceFlow

Browser-based invoicing for freelancers and small agencies. Fill in client and line-item details, see a live preview, and export a polished PDF — typically in under a minute.

```text
Open app → Fill in client + line items → See live preview → Download PDF → Send to client
```

For product, pricing, and business context, see [`INVOICEFLOW.md`](./INVOICEFLOW.md). For domain vocabulary and architecture notes, see [`CONTEXT.md`](./CONTEXT.md).

## Features

- **Invoice Creator** — split-panel form + live preview (`/create`); no account required for the free-tier flow
- **Live Preview** — invoice updates as you type; multi-currency, tax, discount, notes, branding
- **PDF export** — print/PDF via `jspdf` + `html2canvas` (Pro-gated in product)
- **Recurring invoices** — schedules, clients, history (`/recurring`)
- **Client portal** — hosted recipient view (`/portal/$invoiceId`)
- **Freemium gating** — Free / Pro / Agency plans via Blink Auth + Stripe Checkout
- **Upgrade modal** — shown when free users hit Pro features

## Tech stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| App       | React + Vite + TypeScript                      |
| Routing   | TanStack Router                                |
| Styling   | Tailwind CSS + `@blinkdotnew/ui`               |
| Auth / DB | Blink SDK (`@blinkdotnew/sdk`)                 |
| Payments  | Stripe (+ Supabase Edge Function for checkout) |
| PDF       | `jspdf`, `html2canvas`                         |
| Forms     | React Hook Form + Zod                          |

## Routes

| Path                 | Page               |
| -------------------- | ------------------ |
| `/`                  | Landing            |
| `/create`            | Invoice Creator    |
| `/recurring`         | Recurring invoices |
| `/portal/$invoiceId` | Client portal      |

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) (preferred; `bun.lock` is committed)
- Blink project credentials
- Optional: Stripe + Supabase keys for billing flows

### Setup

```bash
bun install
cp .env.example .env
```

Fill in `.env` (see [Environment variables](#environment-variables)). Do not commit secrets.

### Develop

```bash
bun run dev
```

Vite serves on **port 3000** (`strictPort: true`). Open `http://127.0.0.1:3000/`.

### Build & preview

```bash
bun run build
bun run preview
```

## Environment variables

Copy from [`.env.example`](./.env.example):

| Variable                                                                 | Purpose                                        |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| `VITE_BLINK_PROJECT_ID`                                                  | Blink project id (required for local app)      |
| `VITE_BLINK_PUBLISHABLE_KEY`                                             | Blink publishable key (required for local app) |
| `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe billing                                 |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`                           | Client-side Supabase                           |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`       | Server / edge functions                        |

Checkout lives under `supabase/functions/stripe-checkout/`.

## Scripts

```bash
bun run dev              # Vite dev server (port 3000)
bun run build            # Production build
bun run preview          # Preview production build
bun run lint             # Types + ESLint + Stylelint + CSS checks
bun run lint:types       # TypeScript (`tsc --noEmit`)
bun run lint:js          # ESLint
bun run lint:css         # Stylelint
bun run check:css-vars   # Tailwind CSS variable cross-check
bun run check:css-classes # CSS class validation
```

## Project layout

```text
src/
├── pages/           # Landing, InvoiceCreator, RecurringInvoices, ClientPortal
├── components/      # Invoice form/preview, Pro gate, upgrade modal, recurring UI
├── hooks/           # Auth, subscription, recurring, generated invoices
├── blink/           # Blink client
├── layouts/         # Root layout (auth/subscription shell)
└── router.tsx       # TanStack Router route tree
supabase/
└── functions/       # Stripe checkout edge function
docs/agents/         # Agent triage, issue tracker, domain docs pointers
```

## Docs for agents & contributors

- [`CONTEXT.md`](./CONTEXT.md) — domain glossary and architecture notes
- [`INVOICEFLOW.md`](./INVOICEFLOW.md) — full product / business brief
- [`AGENTS.md`](./AGENTS.md) — agent instructions (issues, triage labels, domain docs)
- [`.agents/skills/testing-invoice-flow/`](./.agents/skills/testing-invoice-flow/SKILL.md) — local smoke-test checklist

Issues and PRDs are tracked in GitHub for `effinrich/invoice-flow`.
