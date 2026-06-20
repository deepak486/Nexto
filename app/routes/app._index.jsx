import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Divider,
  Badge,
} from "@shopify/polaris";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const [invoiceCount, latestInvoice, recentInvoices] = await Promise.all([
    prisma.invoice.count({
      where: { shop: session.shop },
    }),
    prisma.invoice.findFirst({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderName: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderName: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
  ]);

  return json({
    invoiceCount,
    latestInvoice,
    recentInvoices,
  });
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

export default function AppHome() {
  const { invoiceCount, latestInvoice, recentInvoices } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="Nexto">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  Invoice management for Shopify orders working
                </Text>
                <Text as="p" tone="subdued">
                  Create invoices from Shopify orders, store the invoice data in the app database, and download PDFs from the invoice detail page.
                </Text>
              </BlockStack>

              <InlineStack gap="300" wrap>
                <Button
                  variant="primary"
                  onClick={() => navigate("/app/invoices")}
                >
                  View invoices
                </Button>
                <Button onClick={() => navigate("/app/invoices")}>
                  Create invoice
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Invoice overview
              </Text>
              <Divider />
              <InlineStack align="space-between">
                <Text as="span" tone="subdued">
                  Total invoices
                </Text>
                <Text as="span" fontWeight="semibold">
                  {invoiceCount}
                </Text>
              </InlineStack>
              <InlineStack align="space-between">
                <Text as="span" tone="subdued">
                  Latest invoice
                </Text>
                <Text as="span" fontWeight="semibold">
                  {latestInvoice?.orderName || "None"}
                </Text>
              </InlineStack>
              <InlineStack align="space-between">
                <Text as="span" tone="subdued">
                  Latest total
                </Text>
                <Text as="span" fontWeight="semibold">
                  {latestInvoice
                    ? `${latestInvoice.total || ""} ${latestInvoice.currency || ""}`.trim()
                    : "-"}
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Latest activity
              </Text>
              <Divider />
              {latestInvoice ? (
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">
                      Order
                    </Text>
                    <Text as="span" fontWeight="semibold">
                      {latestInvoice.orderName}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">
                      Status
                    </Text>
                    <Badge tone="success">{latestInvoice.status || "-"}</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">
                      Created
                    </Text>
                    <Text as="span" fontWeight="semibold">
                      {formatDate(latestInvoice.createdAt)}
                    </Text>
                  </InlineStack>
                </BlockStack>
              ) : (
                <Text as="p" tone="subdued">
                  No invoices have been created yet.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Recent invoices
              </Text>
              <Divider />
              {recentInvoices.length ? (
                <BlockStack gap="250">
                  {recentInvoices.map((invoice) => (
                    <InlineStack key={invoice.id} align="space-between">
                      <BlockStack gap="050">
                        <Text as="span" fontWeight="semibold">
                          {invoice.orderName}
                        </Text>
                        <Text as="span" tone="subdued">
                          {formatDate(invoice.createdAt)}
                        </Text>
                      </BlockStack>
                      <Button
                        variant="plain"
                        onClick={() => navigate(`/app/invoices/${invoice.id}`)}
                      >
                        View
                      </Button>
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : (
                <Text as="p" tone="subdued">
                  No recent invoices available.
                </Text> 
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}