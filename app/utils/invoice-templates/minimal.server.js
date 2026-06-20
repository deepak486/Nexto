export function renderMinimalInvoice(invoice, order, settings) {
  const accent = settings?.themeColor || "#ea7186";
  const softBg = "#f6f6f7";
  const text = "#2f2f2f";
  const muted = "#6b7280";
  const line = "#e5e7eb";

  const items = order?.lineItems?.edges?.map((edge) => edge.node) || [];
  const shippingName = order?.shippingAddress?.name || "Customer";

  const addressParts = [
    order?.shippingAddress?.address1,
    order?.shippingAddress?.address2,
    order?.shippingAddress?.city,
    order?.shippingAddress?.province,
    order?.shippingAddress?.zip,
    order?.shippingAddress?.country,
  ].filter(Boolean);

  const invoiceNumber = `${order?.name || invoice.orderName || ""}-INV`;

  const formatMoney = (money) => {
    if (!money) return "-";
    return `${money.amount} ${money.currencyCode}`;
  };

  const subtotal = formatMoney(order?.subtotalPriceSet?.shopMoney);
  const tax = formatMoney(order?.totalTaxSet?.shopMoney);
  const total = formatMoney(order?.totalPriceSet?.shopMoney);
  const amountPaid = total;
  const amountDue = "0.00";

  const issueDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const shopName = invoice.shop || "Store";
  const website = `${shopName}.myshopify.com`;

  return `
 
    <div style="margin-bottom:50px;padding:0;background:${softBg};font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${text};">
      <div style="margin:0 auto;background:${softBg};">
        
        <div style="height:18px;background:${accent};"></div>

        <div style="padding:56px 58px 48px;">
          
          <section style="display:flex;justify-content:space-between;align-items:flex-start;gap:40px;margin-bottom:54px;">
            <div style="width:34%;">
              <div style="font-size:58px;line-height:0.95;font-weight:300;letter-spacing:-0.04em;color:${accent};margin:0 0 28px;">
                INVOICE
              </div>

              <div style="margin-bottom:18px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${accent};margin-bottom:4px;">
                  Invoice:
                </div>
                <div style="font-size:28px;font-weight:500;color:${text};">
                  ${invoiceNumber}
                </div>
              </div>

              <div>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${accent};margin-bottom:4px;">
                  Issue date:
                </div>
                <div style="font-size:15px;color:${text};">
                  ${issueDate}
                </div>
              </div>
            </div>

            <div style="width:58%;padding-left:34px;border-left:2px solid ${accent}33;">
              <div style="margin-bottom:28px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${accent};margin-bottom:6px;">
                  Supplier
                </div>
                <div style="font-size:20px;font-weight:600;color:${text};margin-bottom:4px;">
                  ${shopName}
                </div>
                <div style="font-size:14px;color:${muted};">
                  Website: ${website}
                </div>
              </div>

              <div>
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${accent};margin-bottom:6px;">
                  Client
                </div>
                <div style="font-size:18px;font-weight:600;color:${text};margin-bottom:6px;">
                  ${shippingName}
                </div>
                <div style="font-size:14px;line-height:1.7;color:${muted};">
                  ${
                    addressParts.length
                      ? addressParts.join("<br/>")
                      : "Shipping address not available"
                  }
                </div>
              </div>
            </div>
          </section>

          <section style="margin-bottom:34px;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="padding:0 0 12px;text-align:left;font-size:13px;font-weight:700;color:${accent};border-bottom:2px solid ${accent};">Item</th>
                  <th style="padding:0 0 12px;text-align:left;font-size:13px;font-weight:700;color:${accent};border-bottom:2px solid ${accent};">Description</th>
                  <th style="padding:0 0 12px;text-align:right;font-size:13px;font-weight:700;color:${accent};border-bottom:2px solid ${accent};">Quantity</th>
                  <th style="padding:0 0 12px;text-align:right;font-size:13px;font-weight:700;color:${accent};border-bottom:2px solid ${accent};">Unit Price</th>
                  <th style="padding:0 0 12px;text-align:right;font-size:13px;font-weight:700;color:${accent};border-bottom:2px solid ${accent};">GST</th>
                  <th style="padding:0 0 12px;text-align:right;font-size:13px;font-weight:700;color:${accent};border-bottom:2px solid ${accent};">Total</th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length === 0
                    ? `
                      <tr>
                        <td colspan="6" style="padding:18px 0;text-align:center;color:${muted};border-bottom:1px solid ${line};">
                          No items
                        </td>
                      </tr>
                    `
                    : items
                        .map((item, index) => {
                          const unit = Number(
                            item.originalUnitPriceSet?.shopMoney?.amount || 0
                          );
                          const qty = Number(item.quantity || 0);
                          const lineTotal = (unit * qty).toFixed(2);
                          const currency =
                            item.originalUnitPriceSet?.shopMoney?.currencyCode ||
                            order?.totalPriceSet?.shopMoney?.currencyCode ||
                            "";
                          
                            const firstTaxLine = item.taxLines?.[0];
                            const gstText = firstTaxLine
                              ? `${firstTaxLine.title || "Tax"} ${Math.round((firstTaxLine.rate || 0) * 100)}%`
                              : "-";

                              // const orderTaxLines = order?.taxLines || [];
                              // const taxSummary = orderTaxLines.length
                              //   ? orderTaxLines
                              //       .map((tax) => `${tax.title} ${Math.round((tax.rate || 0) * 100)}%`)
                              //       .join(", ")
                              //   : "Tax";

                          return `
                            <tr>
                              <td style="padding:14px 0;border-bottom:1px solid ${line};font-size:14px;color:${text};">
                                ${index + 1}
                              </td>
                              <td style="padding:14px 0;border-bottom:1px solid ${line};font-size:14px;color:${text};">
                                <div style="font-weight:500;">${item.name}</div>
                              </td>
                              <td style="padding:14px 0;border-bottom:1px solid ${line};font-size:14px;color:${text};text-align:right;">
                                ${qty}
                              </td>
                              <td style="padding:14px 0;border-bottom:1px solid ${line};font-size:14px;color:${text};text-align:right;">
                                ${unit.toFixed(2)} ${currency}
                              </td>
                              <td style="padding:14px 0;border-bottom:1px solid ${line};font-size:14px;color:${text};text-align:right;">
                                ${gstText}
                              </td>
                              <td style="padding:14px 0;border-bottom:1px solid ${line};font-size:14px;color:${text};text-align:right;font-weight:500;">
                                ${lineTotal} ${currency}
                              </td>
                            </tr>
                          `;
                        })
                        .join("")
                }
              </tbody>
            </table>
          </section>

          <section style="display:flex;justify-content:flex-end;margin-bottom:34px;">
            <div style="width:100%;max-width:360px;">
              <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${accent}55;">
                <span style="font-size:14px;font-weight:700;color:${accent};text-transform:uppercase;">Total excl. tax</span>
                <span style="font-size:16px;font-weight:600;color:${text};">${subtotal}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${accent}55;">
                <span style="font-size:14px;font-weight:700;color:${accent};text-transform:uppercase;">Tax</span>
                <span style="font-size:16px;font-weight:600;color:${text};">${tax}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${accent}55;">
                <span style="font-size:14px;font-weight:700;color:${accent};text-transform:uppercase;">Total incl. tax</span>
                <span style="font-size:16px;font-weight:700;color:${text};">${total}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${accent}55;">
                <span style="font-size:14px;font-weight:700;color:${accent};text-transform:uppercase;">Amount paid</span>
                <span style="font-size:16px;font-weight:700;color:${text};">${amountPaid}</span>
              </div>
            </div>
          </section>

          <section style="border:2px dashed ${accent}44;padding:18px 22px;margin-bottom:46px;">
            <div style="display:flex;justify-content:space-between;gap:24px;">
              <div style="flex:1;">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:${accent};margin-bottom:6px;">
                  Issue date:
                </div>
                <div style="font-size:22px;font-weight:700;color:${accent};">
                  ${issueDate}
                </div>
              </div>
              <div style="flex:1;text-align:right;">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:${accent};margin-bottom:6px;">
                  Amount due:
                </div>
                <div style="font-size:22px;font-weight:700;color:${accent};">
                  ${amountDue}
                </div>
              </div>
            </div>
          </section>

        </div>

        <div style="background:#ffffff;padding:48px 58px 28px;position:relative;">
          <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:16px solid transparent;border-right:16px solid transparent;border-top:16px solid ${softBg};"></div>

          <div style="display:flex;justify-content:space-between;gap:40px;margin-bottom:42px;">
            <div style="flex:1;">
              <p style="margin:0;font-size:14px;color:${text};">
                Thank you for your purchase.
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:${muted};">
                This invoice is generated for Shopify order ${order?.name || "-"}.
              </p>
            </div>

            <div style="width:240px;padding-left:28px;border-left:1px solid ${line};">
              <div style="margin-bottom:18px;">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:${accent};margin-bottom:4px;">
                  Payment method
                </div>
                <div style="font-size:15px;color:${text};">
                  Manual
                </div>
              </div>

              <div>
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:${accent};margin-bottom:4px;">
                  Order number
                </div>
                <div style="font-size:15px;font-weight:600;color:${text};">
                  ${order?.name || "-"}
                </div>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid ${line};padding-top:18px;text-align:center;">
            <div style="font-size:12px;color:${muted};margin-bottom:10px;">
              ${shopName} | Website: ${website}
            </div>
            <div style="font-size:11px;color:#9ca3af;">
              Generated by Nexto | Minimal Template
            </div>
          </div>
        </div>
      </div> 
    </div>`;
} 