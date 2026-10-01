// server/src/utils/emailService.js
// Sends OTP verification emails with Resend (https://resend.com).
//
// Works on Render and on the Resend FREE plan with NO custom domain:
//   • `from` must be Resend's shared test sender: onboarding@resend.dev
//   • Resend then only allows sending to the email address that owns the
//     Resend account (until you verify your own domain at resend.com/domains
//     and switch RESEND_FROM_EMAIL to e.g. "FinanceHub <noreply@yourdomain.com>").

const { Resend } = require("resend");

const DEFAULT_FROM = "FinanceHub <onboarding@resend.dev>";

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

/**
 * Send the 6-digit registration OTP.
 * @param {string} toEmail - recipient address
 * @param {string} otp     - 6-digit verification code
 * @returns {Promise<Object>} Resend response data ({ id }) or a dev-mode stub
 */
const sendOtpEmail = async (toEmail, otp) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Email not configured. Add RESEND_API_KEY to your environment variables (see server/.env.example).",
    );
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  // NOTE: resend.emails.send() does NOT throw on API errors — it resolves with
  // { data, error }, so `error` must be checked explicitly (unlike nodemailer).
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: toEmail,
      subject: "Your FinanceHub Verification Code",
      html: buildOtpEmailHtml(otp),
    });

    if (error) {
      throw new Error(error.message || "Resend rejected the email");
    }

    console.log(
      "✅ OTP email sent to:",
      toEmail,
      "| Message ID:",
      data?.id,
    );
    return data;
  } catch (err) {
    let message = err?.message || "Failed to send verification email";

    // Friendly hint for the most common free-plan mistake
    if (/can only send testing emails/i.test(message)) {
      message +=
        " → Resend's free plan without a verified domain can only deliver to your own Resend account email. Verify a domain at https://resend.com/domains and set RESEND_FROM_EMAIL accordingly.";
    }

    console.error("❌ Resend email error:", message);

    // In development, log the error but still allow registration to continue
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ WARNING: Email not sent in development mode. User still registered.",
      );
      console.warn(
        "To fix: set RESEND_API_KEY in server/.env (get one at https://resend.com/api-keys)",
      );
      return { id: "dev-mode", warning: message };
    }

    throw new Error(message);
  }
};

module.exports = { sendOtpEmail };
