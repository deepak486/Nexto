import { Card, Layout, Page, Text, BlockStack, Button, InlineStack, Divider } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

export default function SupportPage() {
  const navigate = useNavigate();

  return (
    <Page title="">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  Instructions
                </Text>
                <Text as="p" tone="subdued">
                  This page explains how Nexto works inside Shopify admin and how to use the invoice flow.
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  What Nexto does
                </Text>
                <Text as="p" tone="subdued">
                  Nexto shows recent Shopify orders, lets you create an invoice for an order, stores the invoice snapshot in the app database, and generates a downloadable PDF from that saved invoice.
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Invoice workflow
                </Text>
                <BlockStack gap="150">
                  <Text as="p" tone="subdued">
                    1. Open <strong>Invoices</strong> from the sidebar.
                  </Text>
                  <Text as="p" tone="subdued">
                    2. Find the Shopify order you want to invoice.
                  </Text>
                  <Text as="p" tone="subdued">
                    3. Click <strong>Create invoice</strong>.
                  </Text>
                  <Text as="p" tone="subdued">
                    4. Open the invoice detail page.
                  </Text>
                  <Text as="p" tone="subdued">
                    5. Click <strong>Download PDF</strong> to save the invoice file.
                  </Text>
                </BlockStack>
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Common checks
                </Text>
                <Text as="p" tone="subdued">
                  If an invoice is missing, confirm the order exists in the current store and that the invoice was created successfully.
                </Text>
                <Text as="p" tone="subdued">
                  If PDF download does not start, open the invoice detail page again and retry the download from that invoice.
                </Text>
                <Text as="p" tone="subdued">
                  If the invoice already exists for an order, the app will show the existing invoice instead of creating a duplicate.
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  App pages
                </Text>
                <Text as="p" tone="subdued">
                  Home page shows invoice summary and quick actions.
                </Text>
                <Text as="p" tone="subdued">
                  Invoices page shows Shopify orders and invoice actions.
                </Text>
                <Text as="p" tone="subdued">
                  Invoice detail page shows the saved invoice and PDF download option.
                </Text>
              </BlockStack>

              <InlineStack gap="300">
                <Button variant="primary" onClick={() => navigate("/app")}>
                  Go to Home
                </Button>
                
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}