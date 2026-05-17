import { renderClassicInvoice } from "./invoice-templates/classic.server";
import { renderModernInvoice } from "./invoice-templates/modern.server";
import { renderMinimalInvoice } from "./invoice-templates/minimal.server";

export function renderInvoiceHtml(invoice, settings) {
  const theme = settings?.invoiceTheme || "classic";

  if (theme === "modern") return renderModernInvoice(invoice, settings);
  if (theme === "minimal") return renderMinimalInvoice(invoice, settings);
  return renderClassicInvoice(invoice, settings);
}