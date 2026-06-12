export function renderModernInvoice(invoice, order, settings) {
  const accent = settings?.themeColor || "#1A73E8";

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
    <body style="margin:0;padding:40px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
      <div style="margin:0 auto; margin-bottom:30px; border: 1px solid; border-radius:32px;padding:1px;">
        <div style="background:#f8fafc;border-radius:30px;overflow:hidden;">

          <!-- Top gradient bar -->
          <div style="padding:26px 32px 22px;
                      background:linear-gradient(135deg,${accent},#0f172a);
                      color:#e5e7eb;
                      display:flex;
                      justify-content:space-between;
                      align-items:flex-end;
                      gap:24px;
                      flex-wrap:wrap;">
            <div>
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.8;">
                Invoice
              </p>
              <h1 style="margin:0;font-size:26px;font-weight:600;color:#ffffff;">
                ${order?.name || invoice.orderName || "-"}
              </h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                Generated via Nexto • ${invoice.shop || ""}.myshopify.com
              </p>
            </div>

            <div style="text-align:right;font-size:13px;">
              <div style="opacity:0.8;">Invoice No</div>
              <div style="font-weight:600;color:#ffffff;">${invoiceNumber}</div>
              <div style="margin-top:8px;opacity:0.8;">Status</div>
              <div style="display:inline-flex;align-items:center;
                          padding:4px 10px;border-radius:999px;
                          background:rgba(15,23,42,0.6);
                          color:#e5e7eb;font-size:12px;">
                ${invoice.status || order?.displayFinancialStatus || "-"}
              </div>
            </div>
          </div>

          <!-- Three-column meta -->
          <div style="padding:22px 32px 16px;
                      border-bottom:1px solid #e2e8f0;
                      display:flex;
                      flex-wrap:wrap;
                      gap:28px;
                      justify-content:space-between;
                      background:#f8fafc;">
            <!-- From -->
            <div style="flex:1;min-width:230px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">
                From
              </p>
              <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#0f172a;">
                ${invoice.shop || ""}.myshopify.com
              </p>
              <p style="margin:0;font-size:13px;color:#64748b;">
                Invoice issued via Nexto Shopify App<br/>
                Order reference: ${order?.name || invoice.orderName || "-"}
              </p>
            </div>

            <!-- Bill to -->
            <div style="flex:1;min-width:230px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">
                Bill to
              </p>
              <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#0f172a;">
                ${shippingName}
              </p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
                ${addressLines || "Shipping address not available"}
              </p>
            </div>

            <!-- Dates -->
            <div style="min-width:210px;font-size:13px;">
              <table style="width:100%;border-collapse:collapse;">
                <tbody>
                  <tr>
                    <td style="padding:2px 0;color:#94a3b8;">Invoice date</td>
                    <td style="padding:2px 0;text-align:right;color:#0f172a;">
                      ${
                        invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString()
                          : "-"
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0;color:#94a3b8;">Order date</td>
                    <td style="padding:2px 0;text-align:right;color:#0f172a;">
                      ${
                        order?.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0;color:#94a3b8;">Total</td>
                    <td style="padding:2px 0;text-align:right;font-weight:600;color:#0f172a;">
                      ${total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Items -->
          <div style="padding:22px 32px 6px;background:#ffffff;">
            <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0f172a;">
              Items
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="padding:10px 8px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;">Description</th>
                  <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;">Qty</th>
                  <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;">Unit price</th>
                  <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;">Line total</th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length === 0
                    ? `<tr><td colspan="4" style="padding:12px 8px;text-align:center;color:#9ca3af;">No items</td></tr>`
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
                              <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">${item.name}</td>
                              <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${qty}</td>
                              <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${unit.toFixed(2)} ${currency}</td>
                              <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${lineTotal} ${currency}</td>
                            </tr>`;
                        })
                        .join("")
                }
              </tbody>
            </table>
          </div>

          <!-- Totals + notes -->
          <div style="padding:18px 32px 26px;background:#ffffff;display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-start;">
            <div style="flex:1;min-width:260px;font-size:13px;color:#64748b;">
              <p style="margin:0 0 6px;font-weight:500;color:#0f172a;">Notes</p>
              <p style="margin:0 0 4px;">
                This invoice is generated for Shopify order ${order?.name || "-"}.
                Please retain this document for your records.
              </p>
              <p style="margin:10px 0 0;font-size:12px;color:#94a3af;">
                Generated by Nexto • Internal invoice record ID: ${invoice.id}
              </p>
            </div>

            <div style="min-width:220px;">
              <div style="border-radius:14px;background:#0f172a;color:#e5e7eb;padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;opacity:0.85;">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;opacity:0.85;">
                  <span>Tax</span>
                  <span>${tax}</span>
                </div>
                <div style="border-top:1px solid rgba(148,163,184,0.4);margin-top:6px;padding-top:8px;display:flex;justify-content:space-between;font-size:14px;font-weight:600;color:#f9fafb;">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </body>
  </html>`;
}