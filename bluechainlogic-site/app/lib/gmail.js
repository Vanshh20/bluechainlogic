import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOnboardingEmail({ to, clientName, onboardingLink }) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 0;">
      <div style="margin-bottom: 32px;">
        <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: #C8963E;">BLUECHAINLOGIC</span>
      </div>
      <h2 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">Hey ${clientName},</h2>
      <p style="font-size: 16px; line-height: 1.7; color: #555; margin-bottom: 8px;">Welcome aboard! Your onboarding portal is ready.</p>
      <p style="font-size: 16px; line-height: 1.7; color: #555; margin-bottom: 32px;">Click below to get started — it takes about 10 minutes. You'll set up your sending infrastructure, configure your identity, and brief us on your business.</p>
      <a href="${onboardingLink}" style="display: inline-block; padding: 16px 36px; background: #C8963E; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Start Onboarding →</a>
      <p style="font-size: 14px; line-height: 1.7; color: #999; margin-top: 32px;">This link expires in 14 days. If you have any questions, just reply to this email.</p>
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee;">
        <p style="font-size: 13px; color: #999; margin: 0;">— Team Bluechainlogic</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Bluechainlogic" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your Bluechainlogic Onboarding Portal",
    html,
  });
}

export async function sendNotificationEmail({ clientName, companyName, email }) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 0;">
      <h2 style="font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">🎉 New Onboarding Submitted</h2>
      <p style="font-size: 16px; color: #555; margin-bottom: 24px;"><strong>${clientName}</strong> from <strong>${companyName || "—"}</strong> just completed their onboarding.</p>
      <p style="font-size: 14px; color: #888;">Check your admin dashboard for full details, or view the submission in Supabase.</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Bluechainlogic" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `🎉 Onboarding submitted: ${companyName || clientName}`,
    html,
  });
}
