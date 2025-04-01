const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for now, can be linked to user later
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
  originalText: {
    type: String,
    required: true,
  },
  translatedText: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Translation", translationSchema);
