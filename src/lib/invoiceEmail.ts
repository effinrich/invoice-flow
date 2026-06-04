import type { RecurringInvoice } from '../types/recurring'
import type { InvoiceData } from '../types/invoice'
import { calculateTotals, CURRENCIES } from '../types/invoice'

/** Build the HTML email body for an automatically generated invoice */
export function buildInvoiceEmailHtml(params: {
  template: RecurringInvoice
  invoiceData: InvoiceData
  invoiceId: string
  portalBaseUrl: string
}): string {
  const { template, invoiceData, invoiceId, portalBaseUrl } = params
  const { subtotal, taxAmount, discountAmount, total } = calculateTotals(invoiceData)
  const sym = CURRENCIES[invoiceData.currency] || '$'
  const fmt = (n: number) => sym + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const accent = template.accentColor.startsWith('hsl') ? template.accentColor : 'hsl(16 95% 52%)'
  const accentHex = '#F94E10' // fallback solid hex for email clients

  const portalUrl = `${portalBaseUrl}/portal/${invoiceId}`
  const paymentUrl = template.stripePaymentLinkUrl || portalUrl

  const lineItemsHtml = invoiceData.lineItems
    .filter(li => li.description.trim())
    .map(li => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f0ece8;font-size:14px;color:#38312e;">${li.description}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0ece8;font-size:14px;color:#38312e;text-align:center;">${li.quantity}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0ece8;font-size:14px;color:#38312e;text-align:right;">${fmt(li.rate)}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0ece8;font-size:14px;color:#38312e;text-align:right;font-weight:600;">${fmt(li.quantity * li.rate)}</td>
      </tr>`)
    .join('')

  const taxRow = taxAmount > 0
    ? `<tr><td colspan="3" style="padding:8px 16px;text-align:right;font-size:13px;color:#9c8572;">Tax (${invoiceData.taxRate}%)</td><td style="padding:8px 16px;text-align:right;font-size:13px;color:#9c8572;">${fmt(taxAmount)}</td></tr>`
    : ''

  const discountRow = discountAmount > 0
    ? `<tr><td colspan="3" style="padding:8px 16px;text-align:right;font-size:13px;color:#9c8572;">Discount</td><td style="padding:8px 16px;text-align:right;font-size:13px;color:#9c8572;">-${fmt(discountAmount)}</td></tr>`
    : ''

  const logoBlock = template.logoUrl
    ? `<img src="${template.logoUrl}" alt="${template.fromName}" style="height:40px;width:auto;object-fit:contain;margin-bottom:4px;" />`
    : `<div style="width:44px;height:44px;border-radius:10px;background:${accentHex};color:#fff;font-weight:700;font-size:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:4px;">${template.logoText}</div>`

  const notesBlock = invoiceData.notes
    ? `<tr><td colspan="4" style="padding:16px;background:#faf9f7;border-top:1px solid #f0ece8;border-radius:0 0 8px 8px;font-size:13px;color:#9c8572;">${invoiceData.notes}</td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceData.invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f6f4f3;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f3;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:2px solid ${accentHex};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    ${logoBlock}
                    <div style="font-size:18px;font-weight:700;color:#1a1208;margin-top:4px;">${invoiceData.fromName || template.fromName}</div>
                    ${invoiceData.fromEmail ? `<div style="font-size:13px;color:#9c8572;">${invoiceData.fromEmail}</div>` : ''}
                  </td>
                  <td align="right" valign="top">
                    <div style="font-size:28px;font-weight:800;color:${accentHex};">INVOICE</div>
                    <div style="font-size:13px;color:#9c8572;margin-top:4px;">#${invoiceData.invoiceNumber}</div>
                    <div style="font-size:13px;color:#9c8572;">Issued: ${invoiceData.issueDate}</div>
                    <div style="font-size:13px;color:#9c8572;">Due: ${invoiceData.dueDate}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bill To -->
          <tr>
            <td style="padding:20px 32px;background:#faf9f7;border-bottom:1px solid #f0ece8;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9c8572;margin-bottom:6px;">Bill To</div>
              <div style="font-size:15px;font-weight:600;color:#1a1208;">${invoiceData.toName}</div>
              ${invoiceData.toEmail ? `<div style="font-size:13px;color:#6b5c4c;">${invoiceData.toEmail}</div>` : ''}
              ${invoiceData.toAddress ? `<div style="font-size:13px;color:#9c8572;">${invoiceData.toAddress}</div>` : ''}
            </td>
          </tr>

          <!-- Line Items -->
          <tr>
            <td style="padding:0 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <thead>
                  <tr style="background:#faf9f7;">
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9c8572;">Description</th>
                    <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9c8572;">Qty</th>
                    <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9c8572;">Rate</th>
                    <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9c8572;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItemsHtml}
                  <tr>
                    <td colspan="3" style="padding:10px 16px;text-align:right;font-size:13px;color:#9c8572;border-top:1px solid #f0ece8;">Subtotal</td>
                    <td style="padding:10px 16px;text-align:right;font-size:13px;color:#38312e;border-top:1px solid #f0ece8;">${fmt(subtotal)}</td>
                  </tr>
                  ${taxRow}
                  ${discountRow}
                  <tr style="background:#fff8f5;">
                    <td colspan="3" style="padding:14px 16px;text-align:right;font-size:15px;font-weight:700;color:#1a1208;border-top:2px solid ${accentHex};">Total Due</td>
                    <td style="padding:14px 16px;text-align:right;font-size:18px;font-weight:800;color:${accentHex};border-top:2px solid ${accentHex};">${fmt(total)}</td>
                  </tr>
                  ${notesBlock}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 32px;text-align:center;border-top:1px solid #f0ece8;">
              <div style="font-size:14px;color:#9c8572;margin-bottom:16px;">
                Payment is due by <strong style="color:#1a1208;">${invoiceData.dueDate}</strong>.
              </div>
              <a
                href="${paymentUrl}"
                style="display:inline-block;background:${accentHex};color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:8px;"
              >
                View &amp; Pay Invoice →
              </a>
              ${template.stripePaymentLinkUrl ? '' : `
              <div style="font-size:12px;color:#9c8572;margin-top:12px;">
                Or open: <a href="${portalUrl}" style="color:${accentHex};">${portalUrl}</a>
              </div>`}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#faf9f7;border-top:1px solid #f0ece8;text-align:center;">
              <div style="font-size:12px;color:#9c8572;">
                Sent by <strong>${invoiceData.fromName || template.fromName}</strong> via InvoiceFlow
                ${invoiceData.fromEmail ? ` · <a href="mailto:${invoiceData.fromEmail}" style="color:${accentHex};text-decoration:none;">${invoiceData.fromEmail}</a>` : ''}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Plain-text fallback for email clients that don't render HTML */
export function buildInvoiceEmailText(params: {
  template: RecurringInvoice
  invoiceData: InvoiceData
  invoiceId: string
  portalBaseUrl: string
}): string {
  const { template, invoiceData, invoiceId, portalBaseUrl } = params
  const { total } = calculateTotals(invoiceData)
  const sym = CURRENCIES[invoiceData.currency] || '$'
  const fmt = (n: number) => sym + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
  const portalUrl = `${portalBaseUrl}/portal/${invoiceId}`
  const paymentUrl = template.stripePaymentLinkUrl || portalUrl

  const lines = [
    `INVOICE #${invoiceData.invoiceNumber}`,
    `From: ${invoiceData.fromName} <${invoiceData.fromEmail}>`,
    `To: ${invoiceData.toName} <${invoiceData.toEmail}>`,
    `Issued: ${invoiceData.issueDate}  |  Due: ${invoiceData.dueDate}`,
    '',
    '--- Line Items ---',
    ...invoiceData.lineItems.filter(li => li.description.trim()).map(
      li => `${li.description}  x${li.quantity}  @ ${fmt(li.rate)}  = ${fmt(li.quantity * li.rate)}`
    ),
    '',
    `Total Due: ${fmt(total)}`,
    '',
    `Pay here: ${paymentUrl}`,
    '',
    invoiceData.notes || '',
  ]
  return lines.join('\n').trim()
}
