const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const quizQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  level: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ["easy", "medium", "hard"]
  },
  mode: {
    type: String,
    required: true,
    enum: ["multipleChoice", "identification", "fillBlanks"]
  },
  title: { type: String, required: true },
  description: { type: String },
  question: { type: String, required: true },
  options: [optionSchema],
  targetWord: { type: String },
  choices: [{
    id: String,
    text: String
  }],
  translation: { type: String },
  hint: { type: String },
  dialect: { type: String }
}, { timestamps: true });

// Create a unique index on the id field
quizQuestionSchema.index({ id: 1 }, { unique: true });

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

module.exports = QuizQuestion;