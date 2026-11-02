import nodemailer from "nodemailer";

interface ContactNotificationParams {
  name: string;
  email: string;
  message: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  reason?: string;
}

const DEFAULT_RECIPIENT = "muhammadmasood2433@gmail.com";

/**
 * Sends a notification email when a new message is received via the contact form.
 *
 * Configured via environment variables:
 * - EMAIL_USER: The sending email address (e.g., your Gmail)
 * - EMAIL_PASS: Google App Password (16 characters, generated in Google Account Security)
 * - EMAIL_TO: (Optional) Override recipient email (defaults to muhammadmasood2433@gmail.com)
 * - SMTP_HOST: (Optional) SMTP host (defaults to smtp.gmail.com)
 * - SMTP_PORT: (Optional) SMTP port (defaults to 465)
 */
export async function sendContactNotification({
  name,
  email,
  message,
}: ContactNotificationParams): Promise<SendResult> {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const recipient = process.env.EMAIL_TO || DEFAULT_RECIPIENT;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);

  if (!user || !pass) {
    console.warn(
      "[Mailer] SMTP credentials (EMAIL_USER / EMAIL_PASS) are not configured in environment variables."
    );
    return {
      success: false,
      reason: "SMTP credentials not configured in environment variables",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const subject = `💼 New Portfolio Message from ${name}`;
  const textContent = `
You received a new message from your portfolio contact form!

----------------------------------------
Sender Name:  ${name}
Sender Email: ${email}
Received At:  ${new Date().toLocaleString()}
----------------------------------------

Message:
${message}
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #04140D; color: #ffffff; padding: 24px; margin: 0; }
    .card { background-color: #061711; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 16px; padding: 28px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; background: #10B981; color: #03150e; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    h1 { margin: 0; font-size: 22px; color: #ffffff; }
    .meta-item { margin-bottom: 14px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #34D399; font-weight: 600; margin-bottom: 4px; }
    .value { font-size: 15px; color: #e6edf3; }
    .value a { color: #58a6ff; text-decoration: none; }
    .message-box { background-color: #081a14; border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 10px; padding: 18px; color: #ffffff; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin-top: 6px; }
    .footer { margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.4); text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Portfolio Notification</div>
      <h1>New Message Received</h1>
    </div>

    <div class="meta-item">
      <div class="label">From</div>
      <div class="value"><strong>${escapeHtml(name)}</strong></div>
    </div>

    <div class="meta-item">
      <div class="label">Email Address</div>
      <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
    </div>

    <div class="meta-item">
      <div class="label">Received At</div>
      <div class="value">${new Date().toLocaleString()}</div>
    </div>

    <div class="meta-item" style="margin-top: 20px;">
      <div class="label">Message</div>
      <div class="message-box">${escapeHtml(message)}</div>
    </div>

    <div class="footer">
      Sent from Muhammad Masood Sheikh Portfolio Contact Form
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: `"Portfolio Contact Form" <${user}>`,
      to: recipient,
      replyTo: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown mail error";
    console.error("[Mailer] Failed to send notification email:", errorMsg);
    return {
      success: false,
      reason: errorMsg,
    };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

