export function renderMinimalInvoice(invoice, order, settings) {
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
    .join(", ");

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
    <body style="margin:0; margin-bottom:30px; padding:40px;background:#ffffff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;font-size:13px;line-height:1.5;">
      <div style="margin:0 auto;margin-bottom:30px; border: 1px solid ${accent};padding:40px;">

        <!-- Title and basic meta (very simple) -->
        <header style="margin-bottom:20px;">
          <h1 style="margin:0 0 6px;font-size:22px;font-weight:600;">
            Invoice
          </h1>
          <div style="height:2px;width:72px;background:${accent};margin-bottom:12px;"></div>
          <p style="margin:0 0 2px;color:#6b7280;font-size:13px;">
            ${invoice.shop || ""}.myshopify.com
          </p>
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            Generated via Nexto
          </p>
        </header>

        <!-- Two-column info, but light weight -->
        <section style="display:flex;gap:32px;margin-bottom:18px;">
          <div style="flex:1;min-width:220px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#9ca3af;">
              From
            </p>
            <p style="margin:0 0 2px;font-weight:500;">
              ${invoice.shop || ""}.myshopify.com
            </p>
            <p style="margin:0;color:#6b7280;font-size:13px;">
              Invoice issued via Nexto Shopify App<br/>
              Order reference: ${order?.name || invoice.orderName || "-"}
            </p>
          </div>

          <div style="flex:1;min-width:220px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#9ca3af;">
              Bill to
            </p>
            <p style="margin:0 0 2px;font-weight:500;">
              ${shippingName}
            </p>
            <p style="margin:0;color:#6b7280;font-size:13px;">
              ${addressLines || "Shipping address not available"}
            </p>
          </div>
        </section>

        <!-- Simple key/value meta, no boxes -->
        <section style="margin-bottom:18px;">
          <table style="border-collapse:collapse;font-size:13px;">
            <tbody>
              <tr>
                <td style="padding:2px 24px 2px 0;color:#6b7280;">Invoice No</td>
                <td style="padding:2px 0;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding:2px 24px 2px 0;color:#6b7280;">Order No</td>
                <td style="padding:2px 0;">${order?.name || "-"}</td>
              </tr>
              <tr>
                <td style="padding:2px 24px 2px 0;color:#6b7280;">Invoice date</td>
                <td style="padding:2px 0;">${
                  invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString()
                    : "-"
                }</td>
              </tr>
              <tr>
                <td style="padding:2px 24px 2px 0;color:#6b7280;">Order date</td>
                <td style="padding:2px 0;">${
                  order?.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"
                }</td>
              </tr>
              <tr>
                <td style="padding:2px 24px 2px 0;color:#6b7280;">Status</td>
                <td style="padding:2px 0;">${invoice.status || order?.displayFinancialStatus || "-"}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <hr style="border:0;border-top:1px solid #e5e7eb;margin:16px 0 14px;" />

        <!-- Items table, but very light styling -->
        <section>
          <p style="margin:0 0 6px;font-weight:500;">Items</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr>
                <th style="padding:6px 0;text-align:left;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Description</th>
                <th style="padding:6px 0;text-align:right;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Qty</th>
                <th style="padding:6px 0;text-align:right;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Unit</th>
                <th style="padding:6px 0;text-align:right;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Line total</th>
              </tr>
            </thead>
            <tbody>
              ${
                items.length === 0
                  ? `<tr><td colspan="4" style="padding:10px 0;color:#9ca3af;text-align:center;">No items</td></tr>`
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
                            <td style="padding:8px 0;border-top:1px solid #f3f4f6;">${item.name}</td>
                            <td style="padding:8px 0;border-top:1px solid #f3f4f6;text-align:right;">${qty}</td>
                            <td style="padding:8px 0;border-top:1px solid #f3f4f6;text-align:right;">${unit.toFixed(2)} ${currency}</td>
                            <td style="padding:8px 0;border-top:1px solid #f3f4f6;text-align:right;">${lineTotal} ${currency}</td>
                          </tr>`;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </section>

        <!-- Totals: just text + thin accent underline -->
        <section style="margin-top:18px;display:flex;justify-content:flex-end;">
          <table style="font-size:13px;border-collapse:collapse;min-width:220px;">
            <tbody>
              <tr>
                <td style="padding:2px 0;color:#6b7280;">Subtotal</td>
                <td style="padding:2px 0;text-align:right;">${subtotal}</td>
              </tr>
              <tr>
                <td style="padding:2px 0;color:#6b7280;">Tax</td>
                <td style="padding:2px 0;text-align:right;">${tax}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:6px;border-top:1px solid #e5e7eb;"></td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-weight:600;">Total</td>
                <td style="padding:6px 0;text-align:right;font-weight:600;border-bottom:2px solid ${accent};">
                  ${total}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Notes -->
        <section style="margin-top:22px;font-size:12px;color:#6b7280;">
          <p style="margin:0 0 4px;font-weight:500;">Notes</p>
          <p style="margin:0 0 4px;">
            This invoice is generated for Shopify order ${order?.name || "-"}.
            Please retain this document for your records.
          </p>
          <p style="margin:8px 0 0;color:#9ca3af;">
            Generated by Nexto  | Minimal Template
          </p>
        </section>

      </div>
    </body>
  </html>`;
} 