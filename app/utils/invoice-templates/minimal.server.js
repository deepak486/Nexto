export function renderMinimalInvoice(invoice, settings) {
  const accent = settings?.themeColor || "#1A73E8";

  return `
  <html>
    <body style="font-family: Arial, sans-serif; padding: 40px; color: #111827;">
      <div style="max-width: 700px; margin: 0 auto;">
        <h1 style="margin: 0 0 12px; color: ${accent};">Invoice</h1>
        <p style="margin: 0 0 24px; color: #6b7280;">Order: ${invoice.orderName || "-"}</p>
        <hr style="border:none; border-top:1px solid #e5e7eb; margin: 16px 0;" />
        <p><strong>Status:</strong> ${invoice.status || "-"}</p>
        <p><strong>Total:</strong> ${invoice.total || ""} ${invoice.currency || ""}</p>
        <p><strong>Date:</strong> ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</p>
      </div>
    </body>
  </html>`;
}