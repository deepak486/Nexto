export function renderModernInvoice(invoice, settings) {
  const accent = settings?.themeColor || "#1A73E8";

  return `
  <html>
    <body style="font-family: Inter, Arial, sans-serif; padding: 36px; background: #f9fafb; color: #111827;">
      <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
        <div style="padding: 28px; border-bottom: 4px solid ${accent};">
          <h1 style="margin: 0; font-size: 30px;">Invoice</h1>
          <p style="margin: 8px 0 0; color: #6b7280;">Order ${invoice.orderName || "-"}</p>
        </div>
        <div style="padding: 28px; display: grid; gap: 12px;">
          <div style="display:flex; justify-content:space-between;"><span>Status</span><strong>${invoice.status || "-"}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Total</span><strong>${invoice.total || ""} ${invoice.currency || ""}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Date</span><strong>${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</strong></div>
        </div>
      </div>
    </body>
  </html>`;
}