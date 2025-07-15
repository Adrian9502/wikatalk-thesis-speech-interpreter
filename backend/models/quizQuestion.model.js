const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  level: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  mode: { type: String, required: true, enum: ['multipleChoice', 'identification', 'fillBlanks'] },
  title: { type: String, required: true },
  description: String,
  question: { type: String, required: true },
  translation: String,
  dialect: String,
  focusArea: { type: String, enum: ['vocabulary', 'grammar', 'pronunciation'], default: 'vocabulary' },

  options: [{ 
    id: String, 
    text: String, 
    isCorrect: Boolean // Only used for multipleChoice
  }], // For both multipleChoice and identification
  
  answer: String, // For identification and fillBlanks
  hint: String, // For fillBlanks
}, {
  timestamps: true
});

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

module.exports = QuizQuestion;