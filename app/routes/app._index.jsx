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
  Box,
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

function formatAmount(invoice) {
  if (!invoice) return "-";
  return `${invoice.total || ""} ${invoice.currency || ""}`.trim() || "-";
}

function getStatusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (["paid", "success", "completed"].includes(normalized)) return "success";
  if (["pending", "draft", "processing"].includes(normalized)) return "attention";
  if (["failed", "cancelled", "voided", "refunded"].includes(normalized)) return "critical";

  return "info";
}

export default function AppHome() {
  const { invoiceCount, latestInvoice, recentInvoices } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page
      title="Nexto"
      subtitle="Create, manage, and download invoice records for Shopify orders."
      primaryAction={{
        content: "View invoices",
        onAction: () => navigate("/app/invoices"),
      }}
      secondaryActions={[
        {
          content: "Create invoice",
          onAction: () => navigate("/app/invoices"),
        },
      ]}
    >
      <Box paddingBlockEnd="800">
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="500">
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingLg">
                        Invoice operations
                      </Text>
                      <Text as="p" tone="subdued">
                        Review invoice records, monitor recent activity, and open invoice details to download PDFs.
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
                </Box>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <Card>
                <Box padding="500" minHeight="140px">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      Total invoices
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {invoiceCount}
                    </Text>
                    <Text as="p" tone="subdued">
                      Total invoice records created for this store.
                    </Text>
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <Card>
                <Box padding="500" minHeight="140px">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      Latest invoice
                    </Text>
                    <Text as="p" variant="headingLg">
                      {latestInvoice?.orderName || "None"}
                    </Text>
                    <Text as="p" tone="subdued">
                      Most recently created invoice record.
                    </Text>
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <Card>
                <Box padding="500" minHeight="140px">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      Latest total
                    </Text>
                    <Text as="p" variant="headingLg">
                      {formatAmount(latestInvoice)}
                    </Text>
                    <Text as="p" tone="subdued">
                      Total amount from the latest invoice.
                    </Text>
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <Box padding="500" minHeight="220px">
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        Latest activity
                      </Text>
                      {latestInvoice ? (
                        <Badge tone={getStatusTone(latestInvoice.status)}>
                          {latestInvoice.status || "-"}
                        </Badge>
                      ) : null}
                    </InlineStack>

                    <Divider />

                    {latestInvoice ? (
                      <BlockStack gap="300">
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
                            Created
                          </Text>
                          <Text as="span" fontWeight="semibold">
                            {formatDate(latestInvoice.createdAt)}
                          </Text>
                        </InlineStack>

                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Total
                          </Text>
                          <Text as="span" fontWeight="semibold">
                            {formatAmount(latestInvoice)}
                          </Text>
                        </InlineStack>

                        <Box paddingBlockStart="200">
                          <Button
                            variant="plain"
                            onClick={() => navigate(`/app/invoices/${latestInvoice.id}`)}
                          >
                            Open latest invoice
                          </Button>
                        </Box>
                      </BlockStack>
                    ) : (
                      <Text as="p" tone="subdued">
                        No invoices have been created yet.
                      </Text>
                    )}
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <Box padding="500" minHeight="220px">
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        Recent invoices
                      </Text>
                      {recentInvoices.length ? (
                        <Button variant="plain" onClick={() => navigate("/app/invoices")}>
                          View all
                        </Button>
                      ) : null}
                    </InlineStack>

                    <Divider />

                    {recentInvoices.length ? (
                      <BlockStack gap="300">
                        {recentInvoices.map((invoice, index) => (
                          <BlockStack key={invoice.id} gap="200">
                            <InlineStack align="space-between" blockAlign="start">
                              <BlockStack gap="100">
                                <Text as="span" fontWeight="semibold">
                                  {invoice.orderName}
                                </Text>
                                <InlineStack gap="200" wrap>
                                  <Text as="span" tone="subdued">
                                    {formatDate(invoice.createdAt)}
                                  </Text>
                                  <Badge tone={getStatusTone(invoice.status)}>
                                    {invoice.status || "-"}
                                  </Badge>
                                </InlineStack>
                              </BlockStack>

                              <Button
                                variant="plain"
                                onClick={() => navigate(`/app/invoices/${invoice.id}`)}
                              >
                                View
                              </Button>
                            </InlineStack>

                            {index < recentInvoices.length - 1 ? <Divider /> : null}
                          </BlockStack>
                        ))}
                      </BlockStack>
                    ) : (
                      <Text as="p" tone="subdued">
                        No recent invoices available.
                      </Text>
                    )}
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>
          </Layout>
      </Box>
    </Page>
  );
} 