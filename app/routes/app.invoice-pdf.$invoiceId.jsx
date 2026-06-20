import fs from "fs";
import path from "path";
import os from "os";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import prisma from "../db.server";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

export async function loader({ params }) {
  let browser;

  try {
    console.log("PDF loader started");
    console.log("invoiceId:", params.invoiceId);

    if (!params.invoiceId) {
      throw new Response("Invoice ID missing", { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
    });

    if (!invoice) {
      throw new Response("Invoice not found", { status: 404 });
    }

    console.log("invoice found:", invoice.id);

    const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

    const invoiceNumber = `${invoice.orderName || "invoice"}-INV`;

    const invoiceCreatedAt = invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleDateString()
      : "-";

    const orderCreatedAt = invoice.orderDate
      ? new Date(invoice.orderDate).toLocaleDateString()
      : "-";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(invoiceNumber)}</title>
          <style>
            :root { --text: #111827; --muted: #6b7280; --border: #e5e7eb; }
            * { box-sizing: border-box; }
            body { margin: 0; color: var(--text); font-family: Arial, sans-serif; background: #fff; }
            .shell { max-width: 980px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; gap: 24px; padding: 36px 40px 24px; border-bottom: 1px solid var(--border); }
            h1 { margin: 0 0 10px; font-size: 32px; line-height: 1.1; }
            p { margin: 4px 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
            .meta { display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; }
            .meta strong { font-size: 14px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 28px 40px; border-bottom: 1px solid var(--border); }
            h3 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
            .items { padding: 28px 40px 20px; }
            .items h2 { margin: 0 0 16px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); padding: 14px 12px; border-bottom: 1px solid var(--border); background: #fafafa; }
            td { padding: 14px 12px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: top; }
            .num { text-align: right; white-space: nowrap; }
            .summary { display: flex; justify-content: flex-end; padding: 8px 40px 32px; }
            .card { width: 100%; max-width: 360px; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
            .row { display: flex; justify-content: space-between; gap: 16px; padding: 14px 18px; font-size: 14px; border-bottom: 1px solid var(--border); }
            .row.total { background: #111827; color: #fff; font-size: 16px; font-weight: 700; }
            .footer { padding: 20px 40px 36px; color: var(--muted); font-size: 13px; border-top: 1px solid var(--border); }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="header">
              <div>
                <h1>Invoice</h1>
                <p><strong>${escapeHtml(invoice.shop || "")}</strong></p>
                <p>Generated from Nexto</p>
              </div>
              <div class="meta">
                <strong>Invoice No</strong><span>${escapeHtml(invoiceNumber)}</span>
                <strong>Order No</strong><span>${escapeHtml(invoice.orderName || "")}</span>
                <strong>Invoice Date</strong><span>${escapeHtml(invoiceCreatedAt)}</span>
                <strong>Order Date</strong><span>${escapeHtml(orderCreatedAt)}</span>
                <strong>Status</strong><span>${escapeHtml(invoice.status || "-")}</span>
              </div>
            </div>

            <div class="grid">
              <div>
                <h3>From</h3>
                <p><strong>${escapeHtml(invoice.shop || "")}</strong></p>
                <p>Invoice issued via Nexto Shopify App</p>
                <p>Order reference: ${escapeHtml(invoice.orderName || "")}</p>
              </div>
              <div>
                <h3>Bill To</h3>
                <p><strong>${escapeHtml(invoice.shipName || "Customer")}</strong></p>
                ${
                  invoice.shipAddress
                    ? `<p>${escapeHtml(invoice.shipAddress)}</p>`
                    : "<p>Shipping address not available</p>"
                }
              </div>
            </div>

            <div class="items">
              <h2>Items</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 50%">Description</th>
                    <th class="num" style="width: 12%">Qty</th>
                    <th class="num" style="width: 19%">Unit Price</th>
                    <th class="num" style="width: 19%">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    lineItems.length
                      ? lineItems
                          .map((item) => {
                            const unitAmount = Number(item.unitPrice || 0);
                            const quantity = Number(item.quantity || 0);
                            const lineTotal = (unitAmount * quantity).toFixed(2);

                            return `
                              <tr>
                                <td>${escapeHtml(item.name)}</td>
                                <td class="num">${quantity}</td>
                                <td class="num">${unitAmount.toFixed(2)} ${escapeHtml(item.currency || "")}</td>
                                <td class="num">${lineTotal} ${escapeHtml(item.currency || "")}</td>
                              </tr>
                            `;
                          })
                          .join("")
                      : `<tr><td colspan="4">No line items found</td></tr>`
                  }
                </tbody>
              </table>
            </div>

            <div class="summary">
              <div class="card">
                <div class="row">
                  <span>Subtotal</span>
                  <span>${escapeHtml(invoice.subtotal || "")} ${escapeHtml(invoice.currency || "")}</span>
                </div>
                <div class="row">
                  <span>Tax</span>
                  <span>${escapeHtml(invoice.tax || "")} ${escapeHtml(invoice.currency || "")}</span>
                </div>
                <div class="row total">
                  <span>Total</span>
                  <span>${escapeHtml(invoice.total || "")} ${escapeHtml(invoice.currency || "")}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              Generated by Nexto • Internal invoice record ID: ${escapeHtml(invoice.id)}
            </div>
          </div>
        </body>
      </html>
    `;

    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    const cleanOrderName = String(invoice.orderName || "invoice")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim();

    const invoicePdfName = `${cleanOrderName}_INV.pdf`;
    console.log("invoicePdfName:", invoicePdfName);

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