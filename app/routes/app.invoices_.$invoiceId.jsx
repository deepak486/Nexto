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
                 Active Template:{" "}
                    {settings.invoiceTheme?.charAt(0).toUpperCase() + settings.invoiceTheme?.slice(1)}
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