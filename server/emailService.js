/* ============================================================
   KisanMitra - Email Service (Nodemailer / Gmail SMTP)
   ============================================================ */
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_URL    = process.env.APP_URL || 'http://localhost:3000';

// Create Gmail transporter
function createTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set in .env — emails will be skipped.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS   // Gmail App Password (NOT your real password)
    }
  });
}

/* ── Send Magic Link verification email ── */
export async function sendMagicLinkEmail(toEmail, token) {
  const transporter = createTransporter();
  const verifyUrl = `${APP_URL}/api/auth/verify-magic?token=${token}&email=${encodeURIComponent(toEmail)}`;

  if (!transporter) {
    console.log(`[DEV] Magic link would have been sent to ${toEmail}: ${verifyUrl}`);
    return { success: true, dev: true };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f9f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,127,78,0.10);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e7f4e 0%,#2d9e60 100%);padding:36px 40px 28px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
                <span style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 12px;font-size:22px;">🌿</span>
                <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">KisanMitra</span>
              </div>
              <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">AI-Powered Farming Assistant</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#1a1a1a;font-weight:700;">Your Magic Sign-In Link 🔗</h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Click the button below to sign in to your KisanMitra account. This link will expire in <strong>15 minutes</strong>.
              </p>

              <div style="text-align:center;margin:28px 0;">
                <a href="${verifyUrl}" 
                   style="display:inline-block;background:linear-gradient(135deg,#1e7f4e,#2d9e60);color:#ffffff;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(30,127,78,0.3);">
                  ✅ Sign In to KisanMitra
                </a>
              </div>

              <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.5;">
                If you did not request this, you can safely ignore this email.<br>
                This link can only be used once and expires in 15 minutes.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e8f0e8;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;line-height:1.6;">
                KisanMitra — Smart Farming for Every Indian Farmer<br>
                <a href="${APP_URL}" style="color:#1e7f4e;text-decoration:none;">${APP_URL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"KisanMitra" <${EMAIL_USER}>`,
      to: toEmail,
      subject: '🌿 Your KisanMitra Magic Sign-In Link',
      html,
      text: `Sign in to KisanMitra by clicking this link (expires in 15 minutes):\n\n${verifyUrl}\n\nIf you did not request this, ignore this email.`
    });
    console.log(`✅ Magic link email sent to ${toEmail}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    throw err;
  }
}

/* ── Send registration verification email ── */
export async function sendRegistrationVerificationEmail(toEmail, token, name) {
  const transporter = createTransporter();
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(toEmail)}`;

  if (!transporter) {
    console.log(`[DEV] Verification email would have been sent to ${toEmail}: ${verifyUrl}`);
    return { success: true, dev: true };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f9f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,127,78,0.10);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e7f4e 0%,#2d9e60 100%);padding:36px 40px 28px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
                <span style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 12px;font-size:22px;">🌿</span>
                <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">KisanMitra</span>
              </div>
              <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">AI-Powered Farming Assistant</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#1a1a1a;font-weight:700;">Verify Your Email, ${name}! 🎉</h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Welcome to KisanMitra! Please verify your email address to activate your account. 
                This link expires in <strong>24 hours</strong>.
              </p>

              <div style="text-align:center;margin:28px 0;">
                <a href="${verifyUrl}" 
                   style="display:inline-block;background:linear-gradient(135deg,#1e7f4e,#2d9e60);color:#ffffff;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(30,127,78,0.3);">
                  ✅ Verify My Email
                </a>
              </div>

              <div style="background:#f4f9f4;border-radius:12px;padding:20px;margin-top:24px;">
                <p style="margin:0;color:#444;font-size:14px;line-height:1.6;">
                  <strong>📱 What happens next?</strong><br>
                  After verification, you can access AI crop analysis, real-time mandi prices, weather alerts, and more.
                </p>
              </div>

              <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.5;">
                If you did not sign up for KisanMitra, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e8f0e8;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;line-height:1.6;">
                KisanMitra — Smart Farming for Every Indian Farmer<br>
                <a href="${APP_URL}" style="color:#1e7f4e;text-decoration:none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"KisanMitra" <${EMAIL_USER}>`,
      to: toEmail,
      subject: '🌿 Verify your KisanMitra account',
      html,
      text: `Hi ${name},\n\nVerify your KisanMitra account by clicking this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`
    });
    console.log(`✅ Verification email sent to ${toEmail}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to send verification email:', err.message);
    throw err;
  }
}
