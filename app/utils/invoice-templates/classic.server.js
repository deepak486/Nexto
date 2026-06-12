export function renderClassicInvoice(invoice, order, settings) {
  const accent = settings?.themeColor || "#111827";

  const items = order?.lineItems?.edges?.map((edge) => edge.node) || [];
  const shippingName = order?.shippingAddress?.name || "Customer";
  const addressLines = [
    order?.shippingAddress?.address1,
    order?.shippingAddress?.address2,
    order?.shippingAddress?.city,
    order?.shippingAddress?.province,
    order?.shippingAddress?.zip,
    order?.shippingAddress?.country,
  ]
    .filter(Boolean)
    .join("<br/>");

  const invoiceNumber = `${order?.name || invoice.orderName || ""}-INV`;

  const formatMoney = (money) => {
    if (!money) return "-";
    return `${money.amount} ${money.currencyCode}`;
  };

  const subtotal = formatMoney(order?.subtotalPriceSet?.shopMoney);
  const tax = formatMoney(order?.totalTaxSet?.shopMoney);
  const total = formatMoney(order?.totalPriceSet?.shopMoney);

  return `
  <html>
    <body style="margin:0;padding:40px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;color:#111827;">
      <div style="margin:0 auto; margin-bottom:50px; background:#ffffff;border-radius:20px;box-shadow:0 18px 45px rgba(15,23,42,0.16);overflow:hidden;">
        <!-- Top header -->
        <div style="padding:32px 40px 12px;border-bottom:1px solid #e5e7eb;">
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:600;">Invoice</h1>
          <p style="margin:0 0 2px;font-size:14px;color:#6b7280;">
            ${invoice.shop || ""}.myshopify.com
          </p>
          <p style="margin:0;font-size:13px;color:#9ca3af;">
            Generated from Nexto
          </p>
        </div>

        <!-- Meta row -->
        <div style="padding:24px 40px 20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;gap:32px;flex-wrap:wrap;">
          <!-- From / Bill to -->
          <div style="flex:1;min-width:260px;">
            <div style="margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">From</p>
              <p style="margin:0 0 2px;font-weight:600;font-size:14px;">${invoice.shop || ""}.myshopify.com</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">Invoice issued via Nexto Shopify App</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Order reference: ${order?.name || invoice.orderName || "-"}</p>
            </div>

            <div>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Bill to</p>
              <p style="margin:0 0 2px;font-weight:600;font-size:14px;">${shippingName}</p>
              <div style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                ${addressLines || "Shipping address not available"}
              </div>
            </div>
          </div>

          <!-- Invoice meta -->
          <div style="min-width:220px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tbody>
                <tr>
                  <td style="padding:3px 0;color:#9ca3af;">Invoice No</td>
                  <td style="padding:3px 0;text-align:right;font-weight:500;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding:3px 0;color:#9ca3af;">Order No</td>
                  <td style="padding:3px 0;text-align:right;font-weight:500;">${order?.name || "-"}</td>
                </tr>
                <tr>
                  <td style="padding:3px 0;color:#9ca3af;">Invoice Date</td>
                  <td style="padding:3px 0;text-align:right;">${
                    invoice.createdAt
                      ? new Date(invoice.createdAt).toLocaleDateString()
                      : "-"
                  }</td>
                </tr>
                <tr>
                  <td style="padding:3px 0;color:#9ca3af;">Order Date</td>
                  <td style="padding:3px 0;text-align:right;">${
                    order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"
                  }</td>
                </tr>
                <tr>
                  <td style="padding:3px 0;color:#9ca3af;">Status</td>
                  <td style="padding:3px 0;text-align:right;font-weight:500;">${
                    invoice.status || order?.displayFinancialStatus || "-"
                  }</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Items -->
        <div style="padding:24px 40px 8px;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;">Items</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 8px;text-align:left;color:#9ca3af;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Description</th>
                <th style="padding:10px 8px;text-align:right;color:#9ca3af;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Qty</th>
                <th style="padding:10px 8px;text-align:right;color:#9ca3af;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Unit price</th>
                <th style="padding:10px 8px;text-align:right;color:#9ca3af;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Line total</th>
              </tr>
            </thead>
            <tbody>
              ${
                items.length === 0
                  ? `<tr><td colspan="4" style="padding:12px 8px;color:#9ca3af;text-align:center;">No items</td></tr>`
                  : items
                      .map((item) => {
                        const unit = Number(
                          item.originalUnitPriceSet?.shopMoney?.amount || 0
                        );
                        const qty = Number(item.quantity || 0);
                        const lineTotal = (unit * qty).toFixed(2);
                          const currency =
                            item.originalUnitPriceSet?.shopMoney?.currencyCode ||
                            order?.totalPriceSet?.shopMoney?.currencyCode ||
                            "";

                        return `
                          <tr>
                            <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;">${item.name}</td>
                            <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">${qty}</td>
                            <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">${unit.toFixed(2)} ${currency}</td>
                            <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">${lineTotal} ${currency}</td>
                          </tr>`;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </div>

        <!-- Summary + notes -->
        <div style="padding:24px 40px 28px;position:relative;">
          <div style="max-width:320px;margin-left:auto;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,0.12);">
            <div style="padding:10px 16px;display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:#6b7280;">Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div style="padding:10px 16px;display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:#6b7280;">Tax</span>
              <span>${tax}</span>
            </div>
            <div style="padding:12px 16px;background:${accent};color:#ffffff;display:flex;justify-content:space-between;font-size:14px;font-weight:600;">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          <div style="margin-top:28px;font-size:13px;color:#6b7280;">
            <p style="margin:0 0 6px;font-weight:500;">Notes</p>
            <p style="margin:0 0 4px;">
              This invoice is generated for Shopify order ${order?.name || "-"}.
              Please retain this document for your records.
            </p>
          </div>

          <div style="margin-top:18px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:10px;">
            Generated by Nexto  | Classic Template
          </div>
        </div>
      </div>
    </body>
  </html>`;
} 