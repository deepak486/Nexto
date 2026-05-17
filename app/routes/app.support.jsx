import { useActionData, useLoaderData, useNavigate, Form, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
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
  TextField,
  Select,
} from "@shopify/polaris";
import { useState } from "react";
// import { sendSupportEmail } from "../utils/support-email.server";

const ISSUE_TYPES = [
  { label: "Invoice not created", value: "invoice_not_created" },
  { label: "PDF download issue", value: "pdf_download_issue" },
  { label: "Wrong invoice data", value: "wrong_invoice_data" },
  { label: "Other", value: "other" },
];

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const latestInvoice = await prisma.invoice.findFirst({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    select: {
      orderName: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
    },
  });

  return json({
    shop: session.shop,
    latestInvoice,
  });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const issueType = String(formData.get("issueType") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const errors = {};
  if (!name) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  if (!issueType) errors.issueType = "Issue type is required.";
  if (!message) errors.message = "Message is required.";

  if (Object.keys(errors).length) {
    return json({ ok: false, errors }, { status: 400 });
  }

  const subject = `[Nexto Support] ${issueType.replaceAll("_", " ")} - ${session.shop}`;
  const body = [
    `Shop: ${session.shop}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Issue Type: ${issueType}`,
    `Message: ${message}`,
  ].join("\n");

  // await sendSupportEmail({ subject, body });

  return json({ ok: true, message: "Your support request has been submitted." });
}

function fieldError(errors, key) {
  return errors?.[key] || "";
}

export default function SupportPage() {
  const { latestInvoice } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState("invoice_not_created");
  const [message, setMessage] = useState("");
  const submitting = navigation.state === "submitting";

  return (
    <Page title="Support">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text as="p" tone="subdued">
                  Submit an issue if an invoice is missing, PDF download fails, or invoice data looks incorrect.
                </Text>
              </BlockStack>

              <Divider />

              {/* <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Current app scope</Text>
                <Text as="p" tone="subdued">
                  Nexto creates invoices from Shopify orders, stores the invoice snapshot in the app database, and generates downloadable PDF files from the saved invoice record.
                </Text>
              </BlockStack> */}

              {/* <Divider /> */}

              {/* <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Latest invoice snapshot</Text>
                {latestInvoice ? (
                  <BlockStack gap="150">
                    <Text as="p" tone="subdued">Order: {latestInvoice.orderName}</Text>
                    <Text as="p" tone="subdued">Status: {latestInvoice.status || "-"}</Text>
                    <Text as="p" tone="subdued">Total: {latestInvoice.total || ""} {latestInvoice.currency || ""}</Text>
                  </BlockStack>
                ) : (
                  <Text as="p" tone="subdued">No invoices exist yet for this store.</Text>
                )}
              </BlockStack> */}

              {/* <Divider /> */}

              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Report an issue</Text>
                {actionData?.ok ? (
                  <Card>
                    <Text as="p">{actionData.message}</Text>
                  </Card>
                ) : null}

               <Form method="post">
  <BlockStack gap="300">
    <TextField
      label="Name"
      value={name}
      onChange={setName}
      autoComplete="name"
      error={fieldError(actionData?.errors, "name")}
    />
    {/* Hidden input so Remix Form actually receives the value */}
    <input type="hidden" name="name" value={name} />

    <TextField
      label="Email"
      value={email}
      onChange={setEmail}
      type="email"
      autoComplete="email"
      error={fieldError(actionData?.errors, "email")}
    />
    <input type="hidden" name="email" value={email} />

    <Select
      label="Issue type"
      value={issueType}
      onChange={setIssueType}
      options={ISSUE_TYPES}
      error={fieldError(actionData?.errors, "issueType")}
    />
    <input type="hidden" name="issueType" value={issueType} />

    <TextField
      label="Message"
      value={message}
      onChange={setMessage}
      multiline={5}
      error={fieldError(actionData?.errors, "message")}
    />
    <input type="hidden" name="message" value={message} />

    <InlineStack gap="300">
      <Button variant="primary" submit loading={submitting}>
        Submit issue
      </Button>
    </InlineStack>
  </BlockStack>
</Form>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 