import { Page, Layout, Card, BlockStack, Text, Button } from "@shopify/polaris";

export default function Index() {
  return (
    <Page title="Nexto">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Welcome to Nexto
              </Text>
              <Text as="p" variant="bodyMd">
                This is your Shopify embedded app home page.
              </Text>
              <Button url="/app/additional" variant="primary">
                Go to Additional Page
              </Button>
              <Button url="/app/products" variant="secondary">
                Test Product Create
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}