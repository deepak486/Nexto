import { authenticate } from "../shopify.server";
import prisma from "../db.server";
 
export const action = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST": {
        console.log("CUSTOMERS_DATA_REQUEST payload:", JSON.stringify(payload, null, 2));

        // If Shopify requests customer data, acknowledge the request.
        // If later you store customer-linked records by customer ID, collect/export them here.
        return new Response(null, { status: 200 });
      }

      case "CUSTOMERS_REDACT": {
        console.log("CUSTOMERS_REDACT payload:", JSON.stringify(payload, null, 2));

        const customerId = payload?.customer?.id;
        const customerEmail = payload?.customer?.email;
        const customerPhone = payload?.customer?.phone;

        // Your current schema does not store customerId separately.
        // You do store shipName / shipAddress, so redact personal data conservatively.
        // This example anonymizes invoice customer fields for the shop when a redact request comes in.
        // If you later store customerId/orderId relations more precisely, narrow this update logic.
        await prisma.invoice.updateMany({
          where: { shop },
          data: {
            shipName: "REDACTED",
            shipAddress: "REDACTED",
          },
        });

        console.log("Customer redact completed", {
          shop,
          customerId,
          customerEmail,
          customerPhone,
        });

        return new Response(null, { status: 200 });
      }

      case "SHOP_REDACT": {
        console.log("SHOP_REDACT payload:", JSON.stringify(payload, null, 2));

        await prisma.invoice.deleteMany({
          where: { shop },
        });

        await prisma.appSettings.deleteMany({
          where: { shop },
        });

        await prisma.session.deleteMany({
          where: { shop },
        });

        console.log(`Deleted shop data for ${shop}`);
        return new Response(null, { status: 200 });
      }

      default:
        return new Response("Unhandled webhook topic", { status: 404 });
    }
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response("Unauthorized", { status: 401 });
  }
};