import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  await prisma.invoice.deleteMany({
    where: { shop },
  });

  await prisma.appSettings.deleteMany({
    where: { shop },
  });

  if (session) {
    await prisma.session.deleteMany({
      where: { shop },
    });
  }

  return new Response(null, { status: 200 });
}; 