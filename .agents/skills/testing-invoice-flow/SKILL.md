---
name: testing-invoice-flow
description: Test the InvoiceFlow app locally through the browser. Use when validating InvoiceFlow UI changes or smoke-testing app behavior after documentation/config changes.
---

# Testing InvoiceFlow

## Devin Secrets Needed

- `VITE_BLINK_PROJECT_ID` — usually supplied via the repo `.env.local` file.
- `VITE_BLINK_PUBLISHABLE_KEY` — usually supplied via the repo `.env.local` file.

Do not print `.env.local` values. It is enough to verify the file exists before starting the app.

## Local setup

1. From the repo root, install dependencies with:

   ```bash
   bun install
   ```

2. Start the dev server with:

   ```bash
   bun run dev --host 127.0.0.1 --port 5173
   ```

3. Open `http://127.0.0.1:5173/` in Chrome.

## Core smoke test

Use this flow for a fast end-to-end confidence check of the free-tier invoice creator:

1. Verify the landing page loads with the `Invoice clients like a pro in seconds` hero and a visible invoice creation CTA.
2. Click the invoice creation CTA (`Create Invoice Free` or `Create Your First Invoice`).
3. Verify the creator opens without requiring login and the header shows `InvoiceFlow`, `New Invoice`, and `Print Invoice`.
4. Fill the client fields:
   - Client name: `Acme Test Client`
   - Client email: `billing@acme.test`
5. Fill the first line item:
   - Description: `Implementation sprint`
   - Quantity: `2`
   - Rate: `750`
6. Set totals:
   - Tax Rate: `10`
   - Discount: `100`
7. Verify the preview shows:
   - `Acme Test Client`
   - `billing@acme.test`
   - `Implementation sprint`
   - Rate `$750.00`
   - Amount `$1,500.00`
   - Subtotal `$1,500.00`
   - Discount `-$100.00`
   - Tax `(10%)` as `$140.00`
   - Total Due `$1,540.00`
   - Free-tier branding: `Created with InvoiceFlow` and `Free`
8. Check browser console output and report any runtime errors.

## Notes

- The basic free-tier creator flow does not require login.
- Avoid clicking `Print Invoice` during smoke tests unless explicitly testing print/PDF behavior, because it can open a native print dialog.
- If using mouse wheel scrolling while a number input is focused, the browser may change the numeric value. Re-check quantity/rate/tax/discount values before making final assertions.
