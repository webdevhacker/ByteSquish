const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UAParser = require('ua-parser-js');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Session = require('../models/Session');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

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

// Generate 6 digit numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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

const http = require('http');

async function sendSignInAlert(user, ipAddress, userAgent) {
  let location = 'Unknown Location';
  if (ipAddress !== 'Unknown' && !ipAddress.includes('127.0.0.1') && !ipAddress.includes('::1')) {
    location = await new Promise((resolve) => {
      http.get(`http://ip-api.com/json/${ipAddress}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.status === 'success' ? `${json.city}, ${json.country}` : 'Unknown Location');
          } catch (e) { resolve('Unknown Location'); }
        });
      }).on('error', () => resolve('Unknown Location'));
    });
  }

  const emailText = `A new sign-in was detected for your account.\n\nDevice: ${userAgent}\nIP Address: ${ipAddress}\nLocation: ${location}\nTime: ${new Date().toUTCString()}\n\nIf this was you, you can safely ignore this email.`;
  const emailHtml = getEmailTemplate("New Sign-In Detected", "A new sign-in was detected for your account.", null, `<br/><strong>Device:</strong> ${userAgent}<br/><strong>IP Address:</strong> ${ipAddress}<br/><strong>Location:</strong> ${location}<br/><strong>Time:</strong> ${new Date().toUTCString()}<br/><br/>If this was you, you can safely ignore this email. If this wasn't you, please reset your password immediately.`);

  transporter.sendMail({
    from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
    to: user.email,
    subject: "New Sign-In Detected",
    text: emailText,
    html: emailHtml
  }).catch(err => console.error('Failed to send sign-in alert:', err));
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const displayName = name || 'User';

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyOtp = generateOTP();
    const verifyOtpExpiry = new Date(Date.now() + 3600000); // 1 hour

    const user = await User.create({ 
      name: displayName, email, password: hashedPassword, verifyOtp, verifyOtpExpiry 
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
      to: email,
      subject: "Verify Your Email",
      text: `Your verification OTP is: ${verifyOtp}`,
      html: getEmailTemplate("Verify Your Email", "Thanks for signing up! Please use the following one-time password to verify your email address.", verifyOtp)
    });

    res.json({ 
      message: 'Registration successful. Please check your email for the OTP.',
      email
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const user = await User.findOne({
      email, verifyOtp: otp, verifyOtpExpiry: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpiry = null;
    await user.save();

    const rawUA = req.headers['user-agent'] || '';
    const parser = new UAParser(rawUA);
    const uaResult = parser.getResult();
    const userAgent = `${uaResult.browser.name || 'Unknown'} on ${uaResult.os.name || 'Unknown'}`;
    const ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress || 'Unknown';
    
    const session = await Session.create({
      userId: user._id, userAgent, ipAddress
    });

    const token = jwt.sign({ userId: user._id, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    sendSignInAlert(user, ipAddress, userAgent);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during verification' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      const verifyOtp = generateOTP();
      const verifyOtpExpiry = new Date(Date.now() + 3600000); // 1 hour
      user.verifyOtp = verifyOtp;
      user.verifyOtpExpiry = verifyOtpExpiry;
      await user.save();
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
        to: email,
        subject: "Verify Your Email",
        text: `Your verification OTP is: ${verifyOtp}`,
        html: getEmailTemplate("Verify Your Email", "It looks like your account is not verified. Please use the following one-time password to verify your email address.", verifyOtp)
      });
      return res.status(403).json({ 
        error: 'ACCOUNT_NOT_VERIFIED', 
        email
      });
    }

    const rawUA = req.headers['user-agent'] || '';
    const parser = new UAParser(rawUA);
    const uaResult = parser.getResult();
    const userAgent = `${uaResult.browser.name || 'Unknown'} on ${uaResult.os.name || 'Unknown'}`;
    const ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress || 'Unknown';
    
    const session = await Session.create({
      userId: user._id, userAgent, ipAddress
    });

    const token = jwt.sign({ userId: user._id, sessionId: session._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    sendSignInAlert(user, ipAddress, userAgent);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 anyway to prevent email enumeration
      return res.json({ message: 'If an account exists, an email was sent.' });
    }

    const resetToken = generateOTP();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
      to: user.email,
      subject: "Password Reset Request",
      text: `Your password reset OTP is: ${resetToken}`,
      html: getEmailTemplate("Reset Your Password", "We received a request to reset your password. Please use the following one-time password to proceed.", resetToken)
    });

    res.json({ 
      message: 'If an account exists, an email was sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, OTP, and new password required' });

    const user = await User.findOne({
      email: email,
      resetToken: otp,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password cannot be the same as your current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Invalidate all existing sessions for security
    await Session.deleteMany({ userId: user._id });

    transporter.sendMail({
      from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
      to: user.email,
      subject: "Password Reset Successful",
      text: "Your password has been successfully reset. If you did not make this change, please contact support immediately.",
      html: getEmailTemplate("Password Reset Successful", "Your password has been successfully reset.", null, "If you did not make this change, please contact support immediately.")
    }).catch(err => console.error('Failed to send reset success email:', err));

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.userId }).sort({ lastActive: -1 });
    // Mark the current session
    const mapped = sessions.map(s => ({
      ...s.toObject(),
      id: s._id,
      isCurrent: s._id.toString() === req.user.sessionId
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.delete('/sessions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Don't allow revoking current session via this route (use logout instead)
    if (id === req.user.sessionId) {
      return res.status(400).json({ error: 'Cannot revoke current session. Please log out.' });
    }
    
    await Session.deleteOne({ _id: id, userId: req.user.userId });
    res.json({ message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

module.exports = router;
