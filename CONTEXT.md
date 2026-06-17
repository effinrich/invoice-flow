# InvoiceFlow Context

InvoiceFlow is a browser-based invoicing app for freelancers and small agencies. Its core job is to turn project and client details into a polished invoice quickly, with live preview and PDF export.

For the full product, business, and architecture context, read `INVOICEFLOW.md`.

## Core product loop

```text
Open app → Fill in client + line items → See live preview → Download PDF → Send to client
```

## Domain vocabulary

- **InvoiceFlow** — focused invoicing SaaS for freelancers and small agencies.
- **Invoice Creator** — the primary product surface for entering sender, client, invoice, line item, tax, discount, notes, and branding details.
- **Live Preview** — the rendered invoice view that updates as the user edits form fields.
- **Free tier** — entry tier that lets users start invoicing with usage and feature limits.
- **Pro tier** — paid tier that unlocks unlimited invoices, PDF export, templates, branding, status tracking, and client management.
- **Agency tier** — higher paid tier for teams, white-labeling, and API access.
- **Upgrade Modal** — conversion UI shown when a free user hits a Pro feature.
- **Stripe Checkout** — payment flow for subscription upgrades.
- **Subscription record** — persisted plan/status data that controls gated UI access.
- **Blink Auth** — managed authentication for users.
- **Blink DB** — persistence layer for subscriptions and invoice-related data.
- **Recurring Invoice** — template-based schedule for automated or repeated billing.
- **Seed Invoice** — invoice data used to pre-populate the manual creator.
- **Pro Gate** — premium feature access control for Pro/Agency-only flows.
- **Client Portal** — hosted recipient view for viewing or paying invoices.
- **Watermark** — free-tier branding applied to exported invoices.

## Architecture notes

- Frontend is React + Vite + TypeScript.
- Styling uses Tailwind CSS and `@blinkdotnew/ui`.
- PDF export uses `jspdf` and `html2canvas`.
- Subscription state is read through app hooks and persisted in Blink DB.
- The app should stay focused on fast, polished invoice creation rather than broad accounting workflows.
