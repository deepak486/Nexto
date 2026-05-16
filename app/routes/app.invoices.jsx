import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { Page, Layout, Card, TextField, Button, IndexTable } from "@shopify/polaris";
import { useState } from "react";

import prisma from "../db.server";
import { authenticate } from "../shopify.server"; // same import you use elsewhere

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const invoices = await prisma.invoice.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return json({ invoices }); 
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const orderId = formData.get("orderId");

  if (typeof orderId !== "string" || !orderId.trim()) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }

  await prisma.invoice.create({
    data: {
      shop: session.shop,
      orderId,
      // createdAt is default(now()) in Prisma, so no need to pass
    },
  });

  return redirect("."); // reload same page to show new invoice
}
 
export default function InvoicesRoute() {
  const { invoices } = useLoaderData();
  const [orderId, setOrderId] = useState("");

  return (
    <Page title="Invoices">
      <Layout>
        <Layout.Section>
          <Card title="Create test invoice" sectioned>
            <Form method="post">
              <TextField
                label="Order ID"
                name="orderId"
                value={orderId}
                onChange={(value) => setOrderId(value)}
                autoComplete="off"
              />
              <div style={{ marginTop: "1rem" }}>
                <Button submit variant="primary">
                  Create invoice
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>

        {/* rest of your table... */}
      </Layout>
    </Page>
  );
}