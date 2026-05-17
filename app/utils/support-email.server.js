// app/utils/support-email.server.js
import nodemailer from "nodemailer";

export async function sendSupportEmail({ subject, body }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: "dpkverma486@gmail.com",
    subject,
    text: body,
  });
} 