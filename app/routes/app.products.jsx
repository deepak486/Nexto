import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineStack, Button, Box } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
          status
        }
      }
    }`,
    {
      variables: {
        input: {
          title: "Nexto Demo Product",
        },
      },
    }
  );

  const responseJson = await response.json();
  return json({ product: responseJson.data.productCreate.product });
};

export default function ProductsPage() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const createProduct = () => submit({}, { method: "POST" });

  return (
    <Page title="Product Demo">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="300">
                <Button loading={isLoading} onClick={createProduct}>
                  Generate Product
                </Button>
              </InlineStack>

              {actionData?.product && (
                <Box padding="400" background="bg-surface-active" borderWidth="025" borderRadius="200">
                  <pre style={{ margin: 0 }}>
                    <code>{JSON.stringify(actionData.product, null, 2)}</code>
                  </pre>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}