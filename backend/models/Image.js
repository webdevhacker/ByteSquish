const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  originalSize: { type: Number, required: true },
  compressedSize: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
