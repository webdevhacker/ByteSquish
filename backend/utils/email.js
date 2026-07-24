const nodemailer = require('nodemailer');

// Setup Nodemailer transporter
let transporter;
async function setupMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Mock for dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}
setupMailer();

const getEmailTemplate = (title, message, otp = null, subMessage = null) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #f9fafb;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0ea5e9; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px;">BYTE.SQUISH_</h1>
  </div>
  <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
    <h2 style="color: #111827; font-size: 22px; margin-top: 0; margin-bottom: 16px; text-align: center;">${title}</h2>
    <p style="color: #4b5563; line-height: 1.6; font-size: 15px; margin-bottom: 24px; text-align: center;">${message}</p>
    ${otp ? `
    <div style="text-align: center; margin: 32px 0;">
      <span style="display: inline-block; padding: 16px 32px; background-color: #f0f9ff; color: #0284c7; font-size: 36px; font-weight: 900; letter-spacing: 8px; border-radius: 12px; border: 2px dashed #bae6fd;">${otp}</span>
    </div>
    <p style="color: #9ca3af; font-size: 13px; margin-bottom: 0; text-align: center; line-height: 1.5;">This code will expire in 1 hour.<br/>If you didn't request this, you can safely ignore this email.</p>
    ` : ''}
    ${subMessage ? `<p style="color: #4b5563; line-height: 1.6; font-size: 14px; margin-bottom: 0; text-align: center;">${subMessage}</p>` : ''}
  </div>
  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; line-height: 1.6;">
    &copy; ${new Date().getFullYear()} BYTESQUISH SYSTEM. ALL RIGHTS RESERVED.<br/>
    ENGINEERED WITH ❤️ BY <a href="https://isharankumar.com" style="color: #0ea5e9; text-decoration: none; font-weight: 600;">SHARAN KUMAR</a>
  </div>
</div>
`;

// Export a proxy or just the current transporter
module.exports = { 
  get transporter() { return transporter; },
  getEmailTemplate 
};
