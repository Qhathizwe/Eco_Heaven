import type { Request, Response } from "express";
import nodemailer from "nodemailer";

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function sendContactMessageController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const name = cleanText(req.body.name, 100);
    const email = cleanText(req.body.email, 150);
    const subject = cleanText(req.body.subject, 150);
    const message = cleanText(req.body.message, 3000);

    if (
      !name ||
      !email ||
      !subject ||
      !message ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid name, email, subject and message.",
      });
      return;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const recipient = process.env.CONTACT_TO_EMAIL || user;

    if (!host || !user || !pass || !recipient) {
      res.status(503).json({
        success: false,
        message: "Contact email is not configured on the server yet.",
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: recipient,
      replyTo: email,
      subject: `WildHeaven contact: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        message,
      ].join("\n"),
    });

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact message error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send your message at this time.",
    });
  }
}