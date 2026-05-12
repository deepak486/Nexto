import { Page, Layout, Card, BlockStack, Text } from "@shopify/polaris";

export default function AdditionalPage() {
  return (
    <Page title="Additional Page">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Additional Page
              </Text>
              <Text as="p" variant="bodyMd">
                Ye sample page hai. Baad me isko custom feature page bana dena.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}