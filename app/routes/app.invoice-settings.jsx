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
  Button,
  InlineStack,
  Divider,
  ColorPicker,
  Popover,
  Box,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

// --- CUSTOM HIGH-PERFORMANCE COLOR CONVERSION UTILITIES ---
// Safely converts a standard 6-character Hex string (#1A73E8) to a Polaris HSBA object
function localHexToHsb(hex) {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { hue: h, saturation: s, brightness: v, alpha: 1 };
}

// Safely converts a Polaris HSBA object selection back into a standard hex string
function localHsbToHex({ hue, saturation, brightness }) {
  const c = brightness * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = brightness - c;

  let r = 0, g = 0, b = 0;
  if (hue >= 0 && hue < 60) { r = c; g = x; b = 0; }
  else if (hue >= 60 && hue < 120) { r = x; g = c; b = 0; }
  else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x; }
  else if (hue >= 180 && hue < 240) { r = 0; g = x; b = c; }
  else if (hue >= 240 && hue < 300) { r = x; g = 0; b = c; }
  else if (hue >= 300 && hue < 360) { r = c; g = 0; b = x; }

  const toHex = (num) => {
    const hexStr = Math.round((num + m) * 255).toString(16).toUpperCase();
    return hexStr.length === 1 ? "0" + hexStr : hexStr;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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
  
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((active) => !active),
    [],
  );

  // Convert current state Hex string to HSBA using the local function
  const hsbColor = localHexToHsb(themeColor);

  const handleColorChange = (newHsbColor) => {
    // Convert Polaris selection back into a Hex string using the local function
    const hexColor = localHsbToHex(newHsbColor);
    setThemeColor(hexColor);
  };

  const colorPickerActivator = (
    <Button onClick={togglePopoverActive} ariaExpanded={popoverActive}>
      <InlineStack gap="200" align="center">
        <Box
          style={{
            background: themeColor,
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid #babfc3",
          }}
        />
        <Text as="span">{themeColor}</Text>
      </InlineStack>
    </Button>
  );

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
                {/* Safe hidden input field mapping straight to Remix's formData extractors */}
                <input type="hidden" name="themeColor" value={themeColor} />

                <BlockStack gap="300">
                  <Select
                    label="Invoice template"
                    name="invoiceTheme"
                    options={TEMPLATE_OPTIONS}
                    value={invoiceTheme}
                    onChange={setInvoiceTheme}
                    error={actionData?.errors?.invoiceTheme}
                  />

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" tone={actionData?.errors?.themeColor ? "critical" : "default"}>
                      Theme color
                    </Text>
                    
                    <Popover
                      active={popoverActive}
                      activator={colorPickerActivator}
                      autofocusTarget="first-node"
                      onClose={togglePopoverActive}
                    >
                      <Popover.Section>
                        <ColorPicker onChange={handleColorChange} color={hsbColor} />
                      </Popover.Section>
                    </Popover>

                    {actionData?.errors?.themeColor && (
                      <Text as="p" tone="critical" variant="bodyMd">
                        {actionData.errors.themeColor}
                      </Text>
                    )}
                  </BlockStack>

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