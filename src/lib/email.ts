import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const from = () => process.env.EMAIL_FROM ?? process.env.SMTP_USER

export async function sendPasswordRecoveryEmail(to: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: from(),
    to,
    subject: 'Reset your Ascendum Brand Center password',
    html: `<!DOCTYPE html>
<html lang="en">
<body style="font-family:'IBM Plex Sans',Arial,sans-serif;color:#585858;max-width:600px;margin:0 auto;padding:32px;">
  <h2 style="color:#003846;font-family:Montserrat,sans-serif;margin:0 0 16px;">Ascendum Brand Center</h2>
  <p style="margin:0 0 12px;">We received a request to reset the password for your account.</p>
  <p style="margin:0 0 32px;">Click the button below to define a new password:</p>
  <p style="margin:0 0 32px;">
    <a href="${resetUrl}"
       style="display:inline-block;color:#003846;border:1px solid #003846;border-radius:100px;padding:12px 32px;text-decoration:none;font-weight:600;font-size:16px;">
      Reset password
    </a>
  </p>
  <p style="font-size:14px;color:#B1B1B1;margin:0;">
    This link expires in 24 hours. If you did not request a password reset, you can safely ignore this email.
  </p>
</body>
</html>`,
  })
}

export async function sendInvitationEmail(to: string, inviteUrl: string): Promise<void> {
  await transporter.sendMail({
    from: from(),
    to,
    subject: "You've been invited to Ascendum Brand Center",
    html: `<!DOCTYPE html>
<html lang="en">
<body style="font-family:'IBM Plex Sans',Arial,sans-serif;color:#585858;max-width:600px;margin:0 auto;padding:32px;">
  <h2 style="color:#003846;font-family:Montserrat,sans-serif;margin:0 0 16px;">Ascendum Brand Center</h2>
  <p style="margin:0 0 12px;">You have been invited to access the Ascendum Brand Center.</p>
  <p style="margin:0 0 32px;">Click the button below to set your password and activate your account:</p>
  <p style="margin:0 0 32px;">
    <a href="${inviteUrl}"
       style="display:inline-block;color:#003846;border:1px solid #003846;border-radius:100px;padding:12px 32px;text-decoration:none;font-weight:600;font-size:16px;">
      Set your password
    </a>
  </p>
  <p style="font-size:14px;color:#B1B1B1;margin:0;">
    This link expires in 24 hours. If you did not expect this invitation, you can safely ignore this email.
  </p>
</body>
</html>`,
  })
}
