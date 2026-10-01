// server/src/utils/emailService.js
// Provider-agnostic OTP email sender.
//
// Two providers are supported and auto-detected, in this order:
//
//   1. SMTP   (SMTP_USER + SMTP_PASS)  ← use this if you do NOT own a domain.
//      Delivers to ANY recipient with no domain required. Works with a Gmail
//      "App Password", a Brevo SMTP relay, or any other SMTP host.
//
//   2. Resend (RESEND_API_KEY)
//      The free plan WITHOUT a verified domain can only deliver to the address
//      that owns the Resend account — registration for any other address is
//      rejected with a 403 "can only send testing emails..." error.
//
// Configure whichever you have; no code changes are needed to switch.
//
// Both SDKs are `require`d lazily inside their senders so a packaging or
// dependency problem can never crash the whole API while it boots.

const SUBJECT = "Your FinanceHub Verification Code";

const buildOtpEmailHtml = (otp) => `
  <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">FinanceHub</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Personal Expense Tracker</p>
    </div>

    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Verify your email address</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
        Enter this 6-digit code to complete your registration.
        This code expires in <strong>10 minutes</strong>.
      </p>

      <div style="background:#f5f3ff;border:2px solid #e0e7ff;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
          Verification Code
        </p>
        <div style="font-size:48px;font-weight:800;color:#4f46e5;letter-spacing:0.15em;">
          ${otp}
        </div>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
        If you didn't request this, you can safely ignore this email.<br/>
        This code will expire in 10 minutes.
      </p>
    </div>

    <div style="background:#f9fafb;padding:16px 40px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">
        © 2026 FinanceHub · This is an automated email, please do not reply.
      </p>
    </div>
  </div>
`;

/** Which provider is configured? SMTP wins because it works without a domain. */
const getProvider = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return null;
};

// ── Provider 1: SMTP (Gmail App Password, Brevo relay, anything) ──────────────
const sendViaSmtp = async (toEmail, otp) => {
  const nodemailer = require("nodemailer");
  const port = Number(process.env.SMTP_PORT || 465);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  // Gmail only lets you send as the authenticated account (or a verified alias),
  // so the default From is the SMTP user itself.
  const from =
    process.env.SMTP_FROM || `"FinanceHub" <${process.env.SMTP_USER}>`;

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject: SUBJECT,
    html: buildOtpEmailHtml(otp),
  });

  return { id: info.messageId, provider: "smtp" };
};

// ── Provider 2: Resend ───────────────────────────────────────────────────────
const sendViaResend = async (toEmail, otp) => {
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const from =
    process.env.RESEND_FROM_EMAIL || "FinanceHub <onboarding@resend.dev>";

  // NOTE: resend.emails.send() does NOT throw on API errors — it resolves with
  // { data, error }, so `error` must be checked explicitly (unlike nodemailer).
  const { data, error } = await resend.emails.send({
    from,
    to: toEmail,
    subject: SUBJECT,
    html: buildOtpEmailHtml(otp),
  });

  if (error) {
    throw new Error(error.message || "Resend rejected the email");
  }

  return { id: data?.id, provider: "resend" };
};

/**
 * Send the 6-digit registration OTP.
 * @param {string} toEmail - recipient address
 * @param {string} otp     - 6-digit verification code
 * @returns {Promise<Object>} { id, provider } — or a dev-mode stub
 */
const sendOtpEmail = async (toEmail, otp) => {
  const provider = getProvider();

  if (!provider) {
    throw new Error(
      "Email is not configured. Set SMTP_USER + SMTP_PASS (works without a domain) " +
        "or RESEND_API_KEY in your environment variables (see server/.env.example).",
    );
  }

  try {
    const result =
      provider === "smtp"
        ? await sendViaSmtp(toEmail, otp)
        : await sendViaResend(toEmail, otp);

    console.log(
      `✅ OTP email sent to: ${toEmail} via ${result.provider} | id: ${result.id}`,
    );
    return result;
  } catch (err) {
    let message = err?.message || "Failed to send verification email";

    // Friendly hint for the most common free-plan mistake
    if (/can only send testing emails/i.test(message)) {
      message +=
        " → Resend's free plan without a verified domain can only deliver to the Resend account owner's own address." +
        " Either verify a domain at https://resend.com/domains, or set SMTP_USER + SMTP_PASS to switch to Gmail/Brevo SMTP (no domain needed).";
    }

    console.error("❌ Email error:", message);

    // In development, log the error but still allow registration to continue
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ WARNING: Email not sent in development mode. User still registered.",
      );
      return { id: "dev-mode", warning: message };
    }

    throw new Error(message);
  }
};

module.exports = { sendOtpEmail };