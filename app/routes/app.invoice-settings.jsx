import { useActionData, useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Select,
  TextField,
  Button,
  InlineStack,
  Divider,
} from "@shopify/polaris";
import { useState } from "react";

const TEMPLATE_OPTIONS = [
  { label: "Classic", value: "classic" },
  { label: "Modern", value: "modern" },
  { label: "Minimal", value: "minimal" },
];

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const settings = await prisma.appSettings.findUnique({
    where: { shop: session.shop },
  });

  return json({
    settings: settings || {
      invoiceTheme: "classic",
      themeColor: "#1A73E8",
    },
  });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const invoiceTheme = String(formData.get("invoiceTheme") || "classic").trim();
  const themeColor = String(formData.get("themeColor") || "#1A73E8").trim();

  const validThemes = ["classic", "modern", "minimal"];
  const errors = {};

  if (!validThemes.includes(invoiceTheme)) {
    errors.invoiceTheme = "Please select a valid template.";
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(themeColor)) {
    errors.themeColor = "Please enter a valid hex color like #1A73E8.";
  }

  if (Object.keys(errors).length) {
    return json({ ok: false, errors }, { status: 400 });
  }

  await prisma.appSettings.upsert({
    where: { shop: session.shop },
    update: { invoiceTheme, themeColor },
    create: { shop: session.shop, invoiceTheme, themeColor },
  });

  return json({ ok: true, message: "Invoice settings saved successfully." });
}

export default function InvoiceSettingsPage() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const [invoiceTheme, setInvoiceTheme] = useState(settings.invoiceTheme || "classic");
  const [themeColor, setThemeColor] = useState(settings.themeColor || "#1A73E8");

  return (
    <Page title="Invoice settings">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="p" tone="subdued">
                Choose a PDF template and brand color for your invoice layout.
              </Text>

              <Divider />

              {actionData?.ok ? (
                <Card>
                  <Text as="p">{actionData.message}</Text>
                </Card>
              ) : null}

              <Form method="post">
                <BlockStack gap="300">
                  <Select
                    label="Invoice template"
                    name="invoiceTheme"
                    options={TEMPLATE_OPTIONS}
                    value={invoiceTheme}
                    onChange={setInvoiceTheme}
                    error={actionData?.errors?.invoiceTheme}
                  />

                  <TextField
                    label="Theme color"
                    name="themeColor"
                    value={themeColor}
                    onChange={setThemeColor}
                    helpText="Enter a hex color, for example #1A73E8"
                    error={actionData?.errors?.themeColor}
                  />

                  <InlineStack gap="300">
                    <Button variant="primary" submit>
                      Save settings
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}