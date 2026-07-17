// Brand chrome shared by every transactional email. Email clients block
// external stylesheets and webfonts, so everything is inlined and the serif
// stack degrades to Georgia where Cormorant Garamond is unavailable.

const COLORS = {
  warmWhite: "#FAFAF8",
  nearBlack: "#1A1A1A",
  accent: "#B8965A",
  secondaryText: "#6B6560",
  borders: "#E5E2DD",
  calloutBackground: "#F6F1E7",
};

const SERIF = `'Cormorant Garamond', Georgia, serif`;
const SANS = `'DM Sans', Helvetica, Arial, sans-serif`;

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Turns plain-text paragraphs into escaped HTML with preserved line breaks. */
export function textBlockToHtml(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

export function wrapHtml({ title, bodyHtml }: { title: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.warmWhite};">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;padding:8px 0 24px;">
      <span style="font-family:${SERIF};font-size:30px;letter-spacing:3px;color:${COLORS.nearBlack};">Sznyt Design</span>
    </div>
    <div style="background:#ffffff;border:1px solid ${COLORS.borders};border-top:3px solid ${COLORS.accent};padding:32px 28px;font-family:${SANS};color:${COLORS.nearBlack};font-size:15px;line-height:1.6;">
      <h1 style="font-family:${SERIF};font-weight:600;font-size:26px;margin:0 0 20px;color:${COLORS.nearBlack};">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <div style="text-align:center;padding:20px 0;font-family:${SANS};font-size:12px;color:${COLORS.secondaryText};line-height:1.6;">
      Sznyt Design — ręcznie robione drewniane ramki<br>
      <a href="mailto:kontakt@sznytdesign.pl" style="color:${COLORS.accent};text-decoration:none;">kontakt@sznytdesign.pl</a>
    </div>
  </div>
</body>
</html>`;
}

/** Small labelled key/value row used across templates. */
export function metaRowHtml(label: string, value: string): string {
  return `<p style="margin:0 0 4px;"><span style="color:${COLORS.secondaryText};">${escapeHtml(label)}:</span> ${escapeHtml(value)}</p>`;
}

/**
 * Highlighted callout for content that must not be skimmed past (e.g. customer
 * notes with gate codes). Table-based with inline styles — the only markup
 * email clients reliably render.
 */
export function calloutHtml(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:${COLORS.calloutBackground};border-left:3px solid ${COLORS.accent};padding:12px 16px;"><span style="font-family:${SANS};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${COLORS.accent};">${escapeHtml(label)}</span><br><span style="font-size:15px;color:${COLORS.nearBlack};">${textBlockToHtml(value)}</span></td></tr></table>`;
}

/** Accent-colored section heading inside the card. */
export function sectionHeadingHtml(text: string): string {
  return `<h2 style="font-family:${SANS};font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${COLORS.accent};margin:24px 0 8px;">${escapeHtml(text)}</h2>`;
}

export const layoutColors = COLORS;
