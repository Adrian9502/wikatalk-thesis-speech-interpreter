const mongoose = require("mongoose");

// Simplified schema for encrypted text fields
const encryptedTextSchema = {
  encrypted: { type: String, required: true },
  iv: { type: String, required: true },
  algorithm: { type: String, default: "aes-256-cbc" },
};

const translationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  type: {
    type: String,
    enum: ["Speech", "Translate", "Scan"],
    required: true,
  },
  fromLanguage: {
    type: String,
    required: true,
  },
  toLanguage: {
    type: String,
    required: true,
  },
  // UPDATED: Encrypted text fields with simplified structure
  originalText: {
    type: encryptedTextSchema,
    required: true,
  },
  translatedText: {
    type: encryptedTextSchema,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Metadata for encryption tracking
  encrypted: {
    type: Boolean,
    default: true,
    required: true,
  },
  encryptionVersion: {
    type: String,
    default: "1.0",
  },
});

// Add index for better query performance
translationSchema.index({ userId: 1, date: -1 });
translationSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model("Translation", translationSchema);
