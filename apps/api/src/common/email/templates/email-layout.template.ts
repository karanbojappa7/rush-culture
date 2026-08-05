import { brand } from '@linq/site-config';

const COLORS = {
  bg: '#f3f1ec',
  panel: '#fffcf8',
  ink: '#141414',
  mute: '#6a655c',
  line: 'rgba(20,20,20,0.12)',
  accent: '#c8f542',
} as const;

export type EmailLayoutInput = {
  preheader: string;
  title: string;
  eyebrow?: string;
  bodyHtml: string;
  footerNote?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderEmailLayout(input: EmailLayoutInput): string {
  const year = new Date().getFullYear();
  const eyebrow = input.eyebrow
    ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.mute};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(input.eyebrow)}</p>`
    : '';
  const footerNote = input.footerNote
    ? `<p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:${COLORS.mute};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(input.footerNote)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};color:${COLORS.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COLORS.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${COLORS.panel};border:1px solid ${COLORS.line};">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid ${COLORS.line};">
              <p style="margin:0;font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-0.03em;font-family:Georgia,'Times New Roman',serif;color:${COLORS.ink};">${escapeHtml(brand.name)}</p>
              <p style="margin:8px 0 0;font-size:13px;color:${COLORS.mute};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(brand.tagline)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:6px;background:${COLORS.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${eyebrow}
              <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2;font-weight:800;letter-spacing:-0.02em;font-family:Georgia,'Times New Roman',serif;color:${COLORS.ink};">${escapeHtml(input.title)}</h1>
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${COLORS.line};background:#faf8f4;">
              ${footerNote}
              <p style="margin:0;font-size:12px;line-height:1.5;color:${COLORS.mute};font-family:Arial,Helvetica,sans-serif;">
                ${escapeHtml(brand.legalName)} · ${escapeHtml(brand.supportEmail)}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${COLORS.mute};font-family:Arial,Helvetica,sans-serif;">
                © ${year} ${escapeHtml(brand.name)}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { escapeHtml, COLORS as EMAIL_COLORS };
