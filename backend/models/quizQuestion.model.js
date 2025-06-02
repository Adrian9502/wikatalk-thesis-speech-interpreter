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
  focusArea: { type: String, enum: ['vocabulary', 'grammar', 'pronunciation'], default: 'vocabulary' }, // ADD THIS

  // Mode-specific fields
  options: [{ 
    id: String, 
    text: String, 
    isCorrect: Boolean 
  }], // For multipleChoice
  
  choices: [{ 
    id: String, 
    text: String 
  }], // For identification
  
  answer: String, // CHANGE FROM targetWord to answer
  hint: String, // For fillBlanks
}, {
  timestamps: true
});

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

module.exports = QuizQuestion;