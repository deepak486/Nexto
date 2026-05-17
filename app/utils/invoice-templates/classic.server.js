export function renderClassicInvoice(invoice, settings) {
  const accent = settings?.themeColor || "#1A73E8";

  return `
  <html>
    <body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">
      <div style="border: 2px solid ${accent}; border-radius: 12px; overflow: hidden;">
        <div style="background: ${accent}; color: white; padding: 24px;">
          <h1 style="margin: 0; font-size: 28px;">Invoice</h1>
          <p style="margin: 6px 0 0;">Order: ${invoice.orderName || "-"}</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0;">Status</td><td style="padding: 8px 0;">${invoice.status || "-"}</td></tr>
            <tr><td style="padding: 8px 0;">Total</td><td style="padding: 8px 0;">${invoice.total || ""} ${invoice.currency || ""}</td></tr>
            <tr><td style="padding: 8px 0;">Date</td><td style="padding: 8px 0;">${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</td></tr>
          </table>
        </div>
      </div>
    </body>
  </html>`;
}