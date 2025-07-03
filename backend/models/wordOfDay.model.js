const mongoose = require("mongoose");

const wordOfDaySchema = new mongoose.Schema({
  english: {
    type: String,
    required: true,
  },
  translation: {
    type: String,
    required: true,
  },
  pronunciation: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true, // Add index for faster queries by date
  }
}, { timestamps: true });

const WordOfDay = mongoose.model("WordOfDay", wordOfDaySchema);

module.exports = WordOfDay;