import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let cachedTransporter;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return cachedTransporter;
}

export async function sendEmailOtp({ email, code }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[OTP] Email ${email} code ${code} (SMTP not configured).`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your Weekly login code",
    text: `Your Weekly OTP is ${code}. It expires in ${env.OTP_TTL_MINUTES} minutes.`,
  });
}
