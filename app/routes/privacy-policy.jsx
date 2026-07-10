export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f6f7",
        padding: "40px 20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: "#202223",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          lineHeight: 1.7,
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ color: "#6d7175", marginBottom: "32px" }}>
          Effective date: July 10, 2026
        </p>

        <p>
          This Privacy Policy describes how Nexto ("we", "our", or "us") collects,
          uses, stores, and deletes information when merchants install and use the
          Nexto Shopify app.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Information We Collect</h2>
        <p>
          When a merchant installs and uses Nexto, we may collect and store certain
          store and order-related information necessary to provide the app’s
          functionality.
        </p>
        <ul>
          <li>Store information, such as the shop domain.</li>
          <li>
            Order and invoice information, such as order ID, order name, order date,
            status, subtotal, tax, total, and currency.
          </li>
          <li>
            Customer shipping information included in an order or invoice record,
            such as shipping name and shipping address.
          </li>
          <li>
            App settings selected by the merchant, such as invoice template and
            theme color.
          </li>
          <li>
            Session and authentication data required to keep the app installed and
            functioning securely.
          </li>
        </ul>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>How We Use Information</h2>
        <p>
          We use the information we collect only to operate, maintain, and improve
          the Nexto app and its invoice-related features.
        </p>
        <ul>
          <li>To display orders and invoice data inside the app.</li>
          <li>To generate invoice previews and downloadable invoices.</li>
          <li>To save store-specific invoice template and theme settings.</li>
          <li>To authenticate merchants and maintain app sessions.</li>
          <li>To provide support and respond to merchant inquiries.</li>
        </ul>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Data Sharing</h2>
        <p>We do not sell merchant or customer personal information.</p>
        <p>
          We do not share personal information with third parties except where
          necessary to operate the app, comply with the law, protect our rights, or
          respond to valid legal requests.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Data Retention</h2>
        <p>
          We retain data only for as long as needed to provide the app’s services
          and meet legal or operational requirements.
        </p>
        <p>
          If the app is uninstalled, or if Shopify sends a valid privacy or
          redaction request, we delete or redact applicable data in accordance with
          Shopify’s platform requirements and applicable law.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Shopify Privacy Webhooks</h2>
        <p>
          Nexto supports Shopify’s mandatory privacy webhooks, including customer
          data requests, customer redaction requests, and shop redaction requests.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Data Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational measures
          to help protect information against unauthorized access, loss, misuse, or
          alteration. However, no method of transmission or storage is completely
          secure.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Merchant Rights</h2>
        <p>
          Merchants may request information about how their data is handled by
          contacting us using the contact details below.
        </p>
        <p>
          Merchants can also uninstall the app at any time through Shopify admin.
          After uninstall, Shopify may trigger data deletion workflows according to
          Shopify’s policies.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Children’s Privacy</h2>
        <p>
          Nexto is intended for use by businesses and is not directed to children.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make material
          changes, we will update the effective date on this page.
        </p>

        <h2 style={{ marginTop: "32px", fontSize: "24px" }}>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or your data, please
          contact us at:
        </p>
        <p>
          Email: dpkverma486@gmail.com
          <br />
          Support URL: https://nexto-beta.vercel.app
        </p>
      </div>
    </div>
  );
}