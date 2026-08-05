import { brand, formatInr } from '@linq/site-config';
import {
  EMAIL_TEMPLATES,
  OrderConfirmationMailData,
  RenderedMail,
} from '../mail.types';
import { escapeHtml, renderEmailLayout } from './email-layout.template';

export function orderConfirmationTemplateKey() {
  return EMAIL_TEMPLATES.ORDER_CONFIRMATION;
}

export function renderOrderConfirmationMail(
  data: OrderConfirmationMailData,
): RenderedMail {
  const subject = `${brand.name} order ${data.orderNumber} confirmed`;
  const placedOn = data.createdAt.toLocaleString(brand.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(20,20,20,0.1);font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#141414;">
          <strong style="display:block;margin-bottom:4px;">${escapeHtml(item.productName)}</strong>
          <span style="color:#6a655c;font-size:12px;">${escapeHtml(item.color)} / ${escapeHtml(item.size)} · Qty ${item.quantity}</span>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(20,20,20,0.1);font-family:Arial,Helvetica,sans-serif;font-size:14px;white-space:nowrap;vertical-align:top;">
          ${escapeHtml(formatInr(item.lineTotalInPaise))}
        </td>
      </tr>`,
    )
    .join('');

  const address = [
    data.shippingLine1,
    data.shippingLine2,
    `${data.shippingCity}, ${data.shippingState} ${data.shippingPostalCode}`,
    data.shippingCountry,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join('<br />');

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#141414;font-family:Arial,Helvetica,sans-serif;">
      Hi ${escapeHtml(data.customerName)}, thanks for shopping with ${escapeHtml(brand.name)}. We received your order and will pack it soon.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;background:#f7f5f0;border:1px solid rgba(20,20,20,0.1);">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6a655c;font-family:Arial,Helvetica,sans-serif;">Order number</p>
          <p style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.02em;font-family:Georgia,'Times New Roman',serif;color:#141414;">${escapeHtml(data.orderNumber)}</p>
          <p style="margin:10px 0 0;font-size:13px;color:#6a655c;font-family:Arial,Helvetica,sans-serif;">Placed ${escapeHtml(placedOn)} · ${escapeHtml(data.status)} · Payment ${escapeHtml(data.paymentStatus)}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6a655c;font-family:Arial,Helvetica,sans-serif;">Items</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
      ${itemRows}
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
      <tr>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6a655c;">Subtotal</td>
        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#141414;">${escapeHtml(formatInr(data.subtotalInPaise))}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6a655c;">Shipping</td>
        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#141414;">${
          data.shippingInPaise === 0
            ? 'Free'
            : escapeHtml(formatInr(data.shippingInPaise))
        }</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid rgba(20,20,20,0.1);font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#141414;">Total</td>
        <td align="right" style="padding:12px 0 0;border-top:1px solid rgba(20,20,20,0.1);font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#141414;">${escapeHtml(formatInr(data.totalInPaise))}</td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
      <tr>
        <td width="50%" valign="top" style="padding-right:12px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6a655c;font-family:Arial,Helvetica,sans-serif;">Ship to</p>
          <p style="margin:0;font-size:14px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;color:#141414;">
            <strong>${escapeHtml(data.shippingFullName)}</strong><br />
            ${escapeHtml(data.shippingPhone)}<br />
            ${address}
          </p>
        </td>
        <td width="50%" valign="top" style="padding-left:12px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6a655c;font-family:Arial,Helvetica,sans-serif;">Payment</p>
          <p style="margin:0;font-size:14px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;color:#141414;">
            <strong style="text-transform:uppercase;">${escapeHtml(data.paymentMethod || '—')}</strong><br />
            ${escapeHtml(data.paymentDetails || 'Details on file')}<br />
            Status: ${escapeHtml(data.paymentStatus)}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 0;">
      <tr>
        <td style="background:#141414;">
          <a href="${escapeHtml(data.storeUrl)}" style="display:inline-block;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;color:#ffffff;">Continue shopping</a>
        </td>
      </tr>
    </table>
  `;

  const textLines = [
    `${brand.name} — order confirmed`,
    ``,
    `Hi ${data.customerName},`,
    `Thanks for your order ${data.orderNumber}.`,
    `Placed: ${placedOn}`,
    `Status: ${data.status} / Payment: ${data.paymentStatus}`,
    ``,
    `Items:`,
    ...data.items.map(
      (item) =>
        `- ${item.productName} (${item.color}/${item.size}) x${item.quantity} = ${formatInr(item.lineTotalInPaise)}`,
    ),
    ``,
    `Subtotal: ${formatInr(data.subtotalInPaise)}`,
    `Shipping: ${data.shippingInPaise === 0 ? 'Free' : formatInr(data.shippingInPaise)}`,
    `Total: ${formatInr(data.totalInPaise)}`,
    ``,
    `Ship to:`,
    data.shippingFullName,
    data.shippingPhone,
    data.shippingLine1,
    data.shippingLine2 || '',
    `${data.shippingCity}, ${data.shippingState} ${data.shippingPostalCode}`,
    data.shippingCountry,
    ``,
    `Payment: ${data.paymentMethod || '—'} — ${data.paymentDetails || ''}`,
    ``,
    `Shop: ${data.storeUrl}`,
    `Support: ${brand.supportEmail}`,
  ].filter((line) => line !== undefined);

  return {
    subject,
    html: renderEmailLayout({
      preheader: `Order ${data.orderNumber} is confirmed · ${formatInr(data.totalInPaise)}`,
      title: 'Your order is in',
      eyebrow: 'Checkout confirmation',
      bodyHtml,
      footerNote:
        'Questions about sizing, shipping, or returns? Reply to this email or write support.',
    }),
    text: textLines.join('\n'),
  };
}
