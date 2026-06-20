import fs from "fs";
import path from "path";
import os from "os";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { renderClassicInvoice } from "../utils/invoice-templates/classic.server";
import { renderModernInvoice } from "../utils/invoice-templates/modern.server";
import { renderMinimalInvoice } from "../utils/invoice-templates/minimal.server";

function getLocalExecutablePath() {
  const platform = os.platform();

  const candidates =
    platform === "win32"
      ? [
          process.env.PUPPETEER_EXECUTABLE_PATH,
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          path.join(
            process.env.LOCALAPPDATA || "",
            "Google",
            "Chrome",
            "Application",
            "chrome.exe"
          ),
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        ]
      : platform === "darwin"
      ? [
          process.env.PUPPETEER_EXECUTABLE_PATH,
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        ]
      : [
          process.env.PUPPETEER_EXECUTABLE_PATH,
          "/usr/bin/google-chrome",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser",
          "/snap/bin/chromium",
          "/opt/google/chrome/chrome",
        ];

  return candidates.find((p) => p && fs.existsSync(p)) || null;
}

async function launchBrowser() {
  const isProduction =
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (isProduction) {
    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  const executablePath = getLocalExecutablePath();

  if (!executablePath) {
    throw new Error(
      "No local Chrome/Edge executable found. Set PUPPETEER_EXECUTABLE_PATH for local development."
    );
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function loader({ request, params }) {
  let browser;

  try {
    const { admin, session } = await authenticate.admin(request);

    console.log("PDF loader started");
    console.log("invoiceId:", params.invoiceId);
    console.log("shop:", session.shop);

    if (!params.invoiceId) {
      throw new Response("Invoice ID missing", { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.invoiceId,
        shop: session.shop,
      },
    });

    if (!invoice) {
      throw new Response("Invoice not found", { status: 404 });
    }

    const settings = await prisma.appSettings.findUnique({
      where: { shop: session.shop },
    });

    const safeSettings = settings || {
      invoiceTheme: "classic",
      themeColor: "#1A73E8",
    };

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
        variables: {
          id: invoice.orderId,
        },
      }
    );

    const data = await response.json();
    const order = data?.data?.order;

    if (!order) {
      throw new Response("Order not found", { status: 404 });
    }

    let html = "";

    if (safeSettings.invoiceTheme === "modern") {
      html = renderModernInvoice(invoice, order, safeSettings);
    } else if (safeSettings.invoiceTheme === "minimal") {
      html = renderMinimalInvoice(invoice, order, safeSettings);
    } else {
      html = renderClassicInvoice(invoice, order, safeSettings);
    }

    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    const cleanOrderName = String(invoice.orderName || order.name || "invoice")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim();

    const invoicePdfName = `${cleanOrderName}_INV.pdf`;
    console.log("invoicePdfName:", invoicePdfName);
    console.log("template used:", safeSettings.invoiceTheme);

    await browser.close();
    browser = null;

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoicePdfName}"; filename*=UTF-8''${encodeURIComponent(invoicePdfName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    if (browser) {
      try {
        await browser.close();
      } catch {}
    }

    if (error instanceof Response) throw error;

    throw new Response("PDF generation failed", { status: 500 });
  }
}