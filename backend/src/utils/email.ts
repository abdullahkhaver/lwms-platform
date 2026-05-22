import nodemailer, { Transporter } from "nodemailer";

// ─── Transporter (lazy singleton) ────────────────────────────────────────────

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// ─── Email Templates ──────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (opts: SendEmailOptions): Promise<void> => {
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM ?? "LWMS System <noreply@lwms.com>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
};

// ─── Verification Email ───────────────────────────────────────────────────────

export const sendVerificationEmail = async (
  to: string,
  name: string,
  verificationUrl: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: "Verify your LWMS account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#2e7d32">Welcome to LWMS, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}"
           style="display:inline-block;padding:12px 24px;background:#2e7d32;color:#fff;
                  text-decoration:none;border-radius:4px;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#666;font-size:13px">
          This link expires in 24 hours. If you didn't create an account, please ignore this email.
        </p>
        <p style="color:#666;font-size:12px">Or copy this URL: ${verificationUrl}</p>
      </div>
    `,
    text: `Welcome to LWMS, ${name}!\nVerify your email: ${verificationUrl}\nExpires in 24 hours.`,
  });
};

// ─── Password Reset Email ─────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: "LWMS – Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#c62828">Password Reset</h2>
        <p>Hi ${name}, you requested a password reset.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#c62828;color:#fff;
                  text-decoration:none;border-radius:4px;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px">
          This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
        <p style="color:#666;font-size:12px">Or copy this URL: ${resetUrl}</p>
      </div>
    `,
    text: `Hi ${name},\nReset your LWMS password: ${resetUrl}\nExpires in 1 hour.`,
  });
};

// ─── Welcome / Account Active Email ──────────────────────────────────────────

export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: "Your LWMS account is active!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#2e7d32">Account Verified ✓</h2>
        <p>Hi ${name}, your LWMS account is now active. You can submit waste management complaints and track their status.</p>
        <p style="color:#666;font-size:13px">Thank you for helping keep our community clean.</p>
      </div>
    `,
  });
};
