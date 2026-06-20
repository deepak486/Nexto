// import { json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import prisma from "../db.server";
// import { authenticate } from "../shopify.server";
// import { useLocation } from "@remix-run/react";

// export async function loader({ request, params }) {
//   const { admin, session } = await authenticate.admin(request);

//   const invoice = await prisma.invoice.findFirst({
//     where: {
//       id: params.invoiceId,
//       shop: session.shop,
//     },
//   });

//   if (!invoice) {
//     throw new Response("Invoice not found", { status: 404 });
//   }

//   const response = await admin.graphql(
//     `#graphql
//     query getOrder($id: ID!) {
//       order(id: $id) {
//         id
//         name
//         createdAt
//         displayFinancialStatus
//         totalPriceSet {
//           shopMoney {
//             amount
//             currencyCode
//           }
//         }
//         subtotalPriceSet {
//           shopMoney {
//             amount
//             currencyCode
//           }
//         }
//         totalTaxSet {
//           shopMoney {
//             amount
//             currencyCode
//           }
//         }
//         shippingAddress {
//           name
//           address1
//           address2
//           city
//           province
//           zip
//           country
//         }
//         lineItems(first: 50) {
//           edges {
//             node {
//               name
//               quantity
//               originalUnitPriceSet {
//                 shopMoney {
//                   amount
//                   currencyCode
//                 }
//               }
//             }
//           }
//         }
//       }
//     }`,
//     {
//       variables: {
//         id: invoice.orderId,
//       },
//     }
//   );

//   const data = await response.json();
//   const order = data?.data?.order;

//   if (!order) {
//     throw new Response("Order not found", { status: 404 });
//   }

//   return json({
//     invoice,
//     order,
//     shop: session.shop,
//   });
// }


// export default function InvoiceDetail() {
//   const { invoice, order, shop } = useLoaderData();

//   const items = order.lineItems.edges.map((edge) => edge.node);
//   const invoiceNumber = `${order.name}-INV`;

//   const formatMoney = (money) => {
//     if (!money) return "-";
//     return `${money.amount} ${money.currencyCode}`;
//   };

//   const shippingName = order.shippingAddress?.name || "Customer";
//   const addressLines = [
//     order.shippingAddress?.address1,
//     order.shippingAddress?.address2,
//     order.shippingAddress?.city,
//     order.shippingAddress?.province,
//     order.shippingAddress?.zip,
//     order.shippingAddress?.country,
//   ].filter(Boolean);
//   const location = useLocation();

// const handleDownloadPdf = async () => {
//   const response = await fetch(`/app/invoice-pdf/${invoice.id}`);

//   if (!response.ok) {
//     throw new Error("Failed to generate PDF");
//   } 

//   const cleanOrderName = String(invoice.orderName || "invoice")
//   .replace(/[\\/:*?"<>|]/g, "")
//   .trim();

//     const invoicePdfName = `${cleanOrderName}_INV.pdf`;
//     console.log('invoicePdfName: '+invoicePdfName);

//   const blob = await response.blob();
//   const url = window.URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${invoicePdfName}`; 
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   window.URL.revokeObjectURL(url);
// }; 

//   return (
//     <>
//       <style>{`
//         :root {
//           --bg: #f3f4f6;
//           --card: #ffffff;
//           --text: #111827;
//           --muted: #6b7280;
//           --border: #e5e7eb;
//           --accent: #111827;
//         }

//         * {
//           box-sizing: border-box;
//         }

//         body {
//           margin: 0;
//           background: var(--bg);
//           color: var(--text);
//           font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
//         }

//         .invoice-page {
//           padding: 32px 20px 56px;
//         }

//         .toolbar {
//           max-width: 980px;
//           margin: 0 auto 20px;
//           display: flex;
//           justify-content: flex-end;
//           gap: 12px;
//         }

//         .btn {
//           border: 0;
//           background: #111827;
//           color: #fff;
//           padding: 12px 18px;
//           border-radius: 10px;
//           font-size: 14px;
//           font-weight: 600;
//           cursor: pointer;
//         }

//         .btn-secondary {
//           background: #e5e7eb;
//           color: #111827;
//         }

//         .invoice-shell {
//           max-width: 980px;
//           margin: 0 auto;
//           background: var(--card);
//           border: 1px solid var(--border);
//           border-radius: 18px;
//           box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
//           overflow: hidden;
//         }

//         .invoice-header {
//           display: flex;
//           justify-content: space-between;
//           gap: 24px;
//           padding: 36px 40px 24px;
//           border-bottom: 1px solid var(--border);
//         }

//         .brand h1 {
//           margin: 0 0 10px;
//           font-size: 32px;
//           line-height: 1.1;
//         }

//         .brand p,
//         .meta p,
//         .section p,
//         .notes p {
//           margin: 4px 0;
//           color: var(--muted);
//           font-size: 14px;
//           line-height: 1.6;
//         }

//         .meta {
//           min-width: 260px;
//         }

//         .meta-grid {
//           display: grid;
//           grid-template-columns: 120px 1fr;
//           gap: 8px 12px;
//         }

//         .meta-grid strong {
//           color: var(--text);
//           font-size: 14px;
//         }

//         .section-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           padding: 28px 40px;
//           border-bottom: 1px solid var(--border);
//         }

//         .section h3 {
//           margin: 0 0 12px;
//           font-size: 14px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: var(--muted);
//         }

//         .section strong {
//           display: block;
//           margin-bottom: 4px;
//           font-size: 16px;
//           color: var(--text);
//         }

//         .items-wrap {
//           padding: 28px 40px 20px;
//         }

//         .items-title {
//           margin: 0 0 16px;
//           font-size: 18px;
//           font-weight: 700;
//         }

//         table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         thead th {
//           text-align: left;
//           font-size: 13px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: var(--muted);
//           padding: 14px 12px;
//           border-bottom: 1px solid var(--border);
//           background: #fafafa;
//         }

//         tbody td {
//           padding: 14px 12px;
//           border-bottom: 1px solid var(--border);
//           font-size: 14px;
//           vertical-align: top;
//         }

//         tbody td.num,
//         thead th.num {
//           text-align: right;
//           white-space: nowrap;
//         }

//         .summary-wrap {
//           display: flex;
//           justify-content: flex-end;
//           padding: 8px 40px 32px;
//         }

//         .summary-card {
//           width: 100%;
//           max-width: 360px;
//           border: 1px solid var(--border);
//           border-radius: 14px;
//           overflow: hidden;
//           break-inside: avoid;
//           page-break-inside: avoid;
//         }

//         .summary-row {
//           display: flex;
//           justify-content: space-between;
//           gap: 16px;
//           padding: 14px 18px;
//           font-size: 14px;
//           border-bottom: 1px solid var(--border);
//         }

//         .summary-row:last-child {
//           border-bottom: 0;
//         }

//         .summary-row.total {
//           background: #111827;
//           color: #fff;
//           font-size: 16px;
//           font-weight: 700;
//         }

//         .notes {
//           padding: 0 40px 40px;
//         }

//         .notes h3 {
//           margin: 0 0 10px;
//           font-size: 14px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: var(--muted);
//         }

//         .invoice-footer {
//           padding: 20px 40px 36px;
//           color: var(--muted);
//           font-size: 13px;
//           border-top: 1px solid var(--border);
//         }

//         @media (max-width: 768px) {
//           .invoice-header,
//           .section-grid {
//             grid-template-columns: 1fr;
//             display: grid;
//           }

//           .invoice-header {
//             padding: 28px 22px 20px;
//           }

//           .section-grid,
//           .items-wrap,
//           .summary-wrap,
//           .notes,
//           .invoice-footer {
//             padding-left: 22px;
//             padding-right: 22px;
//           }

//           .summary-wrap {
//             justify-content: stretch;
//           }

//           .summary-card {
//             max-width: 100%;
//           }
//         }

//         @media print {
//           @page {
//             margin: 0.5in;
//             size: A4;
//           }

//           body {
//             background: #fff;
//           }

//           .toolbar {
//             display: none;
//           }

//           .invoice-page {
//             padding: 0;
//           }

//           .invoice-shell {
//             max-width: 100%;
//             border: 0;
//             border-radius: 0;
//             box-shadow: none;
//           }
//         }
//       `}</style>

//       <div className="invoice-page">
//         <div className="toolbar">
//           <button className="btn btn-secondary" onClick={() => window.history.back()}>
//             Back
//           </button>

//           {/* <button className="btn" onClick={() => window.print()}>
//             Print / Save as PDF
//           </button> */}
//           <button
//               className="btn "
//                onClick={handleDownloadPdf}
//             >
//             Download PDF
//           </button>
//         </div>

//         <div className="invoice-shell">
//           <div className="invoice-header">
//             <div className="brand">
//               <h1>Invoice</h1>
//               <p><strong>{shop}</strong></p>
//               <p>Generated from Nexto</p>
//             </div>

//             <div className="meta">
//               <div className="meta-grid">
//                 <strong>Invoice No</strong>
//                 <span>{invoiceNumber}</span>

//                 <strong>Order No</strong>
//                 <span>{order.name}</span>

//                 <strong>Invoice Date</strong>
//                 <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>

//                 <strong>Order Date</strong>
//                 <span>{new Date(order.createdAt).toLocaleDateString()}</span>

//                 <strong>Status</strong>
//                 <span>{order.displayFinancialStatus}</span>
//               </div>
//             </div>
//           </div>

//           <div className="section-grid">
//             <div className="section">
//               <h3>From</h3>
//               <strong>{shop}</strong>
//               <p>Invoice issued via Nexto Shopify App</p>
//               <p>Order reference: {order.name}</p>
//             </div>

//             <div className="section">
//               <h3>Bill To</h3>
//               <strong>{shippingName}</strong>
//               {addressLines.length > 0 ? (
//                 addressLines.map((line, index) => <p key={index}>{line}</p>)
//               ) : (
//                 <p>Shipping address not available</p>
//               )}
//             </div>
//           </div>

//           <div className="items-wrap">
//             <h2 className="items-title">Items</h2>

//             <table>
//               <thead>
//                 <tr>
//                   <th style={{ width: "50%" }}>Description</th>
//                   <th className="num" style={{ width: "12%" }}>Qty</th>
//                   <th className="num" style={{ width: "19%" }}>Unit Price</th>
//                   <th className="num" style={{ width: "19%" }}>Line Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, index) => {
//                   const unitAmount = Number(item.originalUnitPriceSet?.shopMoney?.amount || 0);
//                   const quantity = Number(item.quantity || 0);
//                   const lineTotal = (unitAmount * quantity).toFixed(2);
//                   const currency = item.originalUnitPriceSet?.shopMoney?.currencyCode || "";

//                   return (
//                     <tr key={index}>
//                       <td>{item.name}</td>
//                       <td className="num">{quantity}</td>
//                       <td className="num">{unitAmount.toFixed(2)} {currency}</td>
//                       <td className="num">{lineTotal} {currency}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <div className="summary-wrap">
//             <div className="summary-card">
//               <div className="summary-row">
//                 <span>Subtotal</span>
//                 <span>{formatMoney(order.subtotalPriceSet?.shopMoney)}</span>
//               </div>
//               <div className="summary-row">
//                 <span>Tax</span>
//                 <span>{formatMoney(order.totalTaxSet?.shopMoney)}</span>
//               </div>
//               <div className="summary-row total">
//                 <span>Total</span>
//                 <span>{formatMoney(order.totalPriceSet?.shopMoney)}</span>
//               </div>
//             </div>
//           </div>

//           <div className="notes">
//             <h3>Notes</h3>
//             <p>
//               This invoice is generated for Shopify order {order.name}. Please retain this
//               document for your records.
//             </p>
//           </div>

//           <div className="invoice-footer">
//             Generated by Nexto • Internal invoice record ID: {invoice.id}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
} from "@shopify/polaris";
import { useState } from "react";
import sanitizeHtml from "sanitize-html";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { renderClassicInvoice } from "../utils/invoice-templates/classic.server";
import { renderModernInvoice } from "../utils/invoice-templates/modern.server";
import { renderMinimalInvoice } from "../utils/invoice-templates/minimal.server";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.invoiceId,
      shop: session.shop,
    },
  });

  if (!invoice) {
    throw new Response("Invoice not found", { status: 404 });
  }

  const settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  const safeSettings = settings || {
    invoiceTheme: "classic",
    themeColor: "#1A73E8",
  };

  const response = await admin.graphql(
    `#graphql
    query getOrder($id: ID!) {
      order(id: $id) {
        id
        name
        createdAt
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        shippingAddress {
          name
          address1
          address2
          city
          province
          zip
          country
        }
        lineItems(first: 50) {
          edges {
            node {
              name
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }`,
    {
      variables: {
        id: invoice.orderId,
      },
    }
  );

  const data = await response.json();
  const order = data?.data?.order;

  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }

  const templatePayload = {
    invoice,
    order,
    shop: session.shop,
    settings: safeSettings,
  };

  let rawInvoiceHtml = "";

  if (safeSettings.invoiceTheme === "modern") {
    rawInvoiceHtml = renderModernInvoice(invoice, order, safeSettings);
  } else if (safeSettings.invoiceTheme === "minimal") {
    rawInvoiceHtml = renderMinimalInvoice(invoice, order, safeSettings);
  } else {
    rawInvoiceHtml = renderClassicInvoice(invoice, order, safeSettings);
  } 
 
  const invoiceHtml = sanitizeHtml(rawInvoiceHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "html",
      "head",
      "body",
      "style",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      "*": ["class", "style"],
    },
  });

  return json({
    invoice,
    shop: session.shop,
    settings: safeSettings,
    invoiceHtml,
  });
}

export default function InvoiceDetail() {
  const { invoice, settings, invoiceHtml } = useLoaderData();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);

      const response = await fetch(`/app/invoice-pdf/${invoice.id}`, {
        method: "GET",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const cleanOrderName = String(invoice.orderName || "invoice")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${cleanOrderName}_INV.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Page
      title="Invoice Preview"
      backAction={{ content: "Invoices", onAction: () => navigate("/app/invoices") }}
      primaryAction={{
        content: "Download PDF",
        onAction: handleDownloadPdf,
        loading: downloading,
      }}
      secondaryActions={[
        {
          content: "Print",
          onAction: () => window.print(),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text as="p" variant="bodyMd">
                  Active Template: {settings.invoiceTheme}
                </Text>
                <Text as="p" variant="bodyMd">
                  Theme Color: {settings.themeColor}
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
}; 