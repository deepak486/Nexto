import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  IndexTable,
  Text,
  Badge,
} from "@shopify/polaris";

import prisma from "../db.server";
import { authenticate } from "../shopify.server";

// ─── Loader: fetch real Shopify orders + existing invoices ───────────────────
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    query getOrders {
      orders(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              firstName
              lastName
              email
            }
          }
        }
      }
    }
  `);

  const data = await response.json();
  const orders = data?.data?.orders?.edges?.map((edge) => edge.node) || [];

  const invoices = await prisma.invoice.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return json({ orders, invoices, shop: session.shop });
}

// ─── Action: create invoice for a real order ─────────────────────────────────
export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const orderId = formData.get("orderId");

  if (!orderId) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }

  const existing = await prisma.invoice.findFirst({
    where: { shop: session.shop, orderId },
  });

  if (existing) {
    return json({ error: "Invoice already exists for this order" }, { status: 400 });
  }

  const response = await admin.graphql(
    `#graphql
    query getOrder($id: ID!) {
      order(id: $id) {
        id
        name
        createdAt
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        shippingAddress {
          name
          address1
          address2
          city
          province
          zip
          country
        }
        lineItems(first: 50) {
          edges {
            node {
              name
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }`,
    {
      variables: { id: orderId },
    }
  );

  const result = await response.json();
  const order = result?.data?.order;

  if (!order) {
    return json({ error: "Order not found in Shopify" }, { status: 404 });
  }

  const addressLines = [
    order.shippingAddress?.address1,
    order.shippingAddress?.address2,
    order.shippingAddress?.city,
    order.shippingAddress?.province,
    order.shippingAddress?.zip,
    order.shippingAddress?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const lineItemsData =
    order.lineItems?.edges?.map((edge) => ({
      name: edge.node.name || "",
      quantity: edge.node.quantity || 0,
      unitPrice: edge.node.originalUnitPriceSet?.shopMoney?.amount || "0",
      currency: edge.node.originalUnitPriceSet?.shopMoney?.currencyCode || "",
    })) || [];

  console.log("lineItems payload:", JSON.stringify(lineItemsData, null, 2));

  await prisma.invoice.create({
    data: {
      shop: session.shop,
      orderId: order.id,
      orderName: order.name || "",
      orderDate: order.createdAt ? new Date(order.createdAt) : null,
      status: order.displayFinancialStatus || "",
      subtotal: order.subtotalPriceSet?.shopMoney?.amount || "",
      tax: order.totalTaxSet?.shopMoney?.amount || "",
      total: order.totalPriceSet?.shopMoney?.amount || "",
      currency: order.totalPriceSet?.shopMoney?.currencyCode || "",
      shipName: order.shippingAddress?.name || "",
      shipAddress: addressLines,
      lineItems: lineItemsData,
    },
  });

  return redirect(".");
}

function getStatusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (["paid", "success", "completed"].includes(normalized)) return "success";
  if (["pending", "draft", "processing"].includes(normalized)) return "attention";
  if (["failed", "cancelled", "voided", "refunded"].includes(normalized)) return "critical";

  return "info";
}

// ─── UI ───────────────────────────────────────────────────────────────────────
export default function InvoicesRoute() {
  const { orders, invoices } = useLoaderData();
  const navigate = useNavigate();

  const invoiceByOrderId = new Map(invoices.map((inv) => [inv.orderId, inv]));

  return (
    <Page title="Invoices">
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={{ singular: "order", plural: "orders" }}
              itemCount={orders.length}
              headings={[
                { title: "Order" },
                { title: "Customer" },
                { title: "Total" },
                { title: "Status" },
                { title: "Action" },
              ]}
              selectable={false}
            >
              {orders.map((order, index) => {
                const existingInvoice = invoiceByOrderId.get(order.id);
                const customerName = order.customer
                  ? `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim()
                  : "Guest";

                return (
                  <IndexTable.Row id={order.id} key={order.id} position={index}>
                    <IndexTable.Cell>
                      <Text fontWeight="bold">{order.name}</Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{customerName}</IndexTable.Cell>
                    <IndexTable.Cell>
                      {order.totalPriceSet?.shopMoney?.amount}{" "}
                      {order.totalPriceSet?.shopMoney?.currencyCode}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={getStatusTone(order.status)}>{order.displayFinancialStatus}</Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {existingInvoice ? (
                        <Button
                          size="slim"
                          variant="secondary"
                          onClick={() => navigate(`/app/invoices/${existingInvoice.id}`)}
                        >
                          View invoice
                        </Button>
                      ) : (
                        <Form method="post">
                          <input type="hidden" name="orderId" value={order.id} />
                          <Button submit size="slim" variant="primary">
                            Create invoice
                          </Button>
                        </Form>
                      )}
                    </IndexTable.Cell>
                  </IndexTable.Row>
                );
              })}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}