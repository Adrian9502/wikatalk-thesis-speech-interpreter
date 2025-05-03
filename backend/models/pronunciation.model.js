const mongoose = require("mongoose");

const pronunciationSchema = new mongoose.Schema({
  english: { type: String, required: true },
  translations: {
    type: Map,
    of: {
      translation: { type: String },
      pronunciation: { type: String, required: true }
    }
  }
});

module.exports = mongoose.model("Pronunciation", pronunciationSchema);