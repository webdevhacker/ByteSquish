const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: 'User' },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifyOtp: { type: String },
  verifyOtpExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  isAdmin: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  inactivityState: { type: Number, default: 0 }, // 0: active, 1: 1st reminder, 2: 2nd reminder
  isDeactivated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
