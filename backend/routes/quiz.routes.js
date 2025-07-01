const express = require("express");
const router = express.Router();
const QuizQuestion = require("../models/quizQuestion.model");

// Get all quiz questions
router.get("/", async (req, res) => {
  try {
    const questions = await QuizQuestion.find({});
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get questions by game mode
router.get("/mode/:mode", async (req, res) => {
  try {
    const { mode } = req.params;
    console.log(`[API] Fetching all questions for mode: ${mode}`);
    
    // Get all questions for this mode
    const questions = await QuizQuestion.find({ mode }).sort({ id: 1, questionId: 1 });
    
    console.log(`[API] Found ${questions.length} questions for ${mode}`);
    
    // Log sample data for debugging
    if (questions.length > 0) {
      console.log(`[API] Sample question structure:`, {
        id: questions[0].id,
        questionId: questions[0].questionId,
        title: questions[0].title,
        difficulty: questions[0].difficulty,
        mode: questions[0].mode,
        hasOptions: !!questions[0].options,
        optionsCount: questions[0].options?.length || 0,
        sampleOption: questions[0].options?.[0] || null
      });
    }
    
    res.json(questions);
  } catch (err) {
    console.error(`[API] Error fetching questions for ${mode}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Get questions by difficulty
router.get("/difficulty/:difficulty", async (req, res) => {
  try {
    const { difficulty } = req.params;
    const questions = await QuizQuestion.find({ difficulty });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get question by id, mode and difficulty
router.get("/level/:id/mode/:mode", async (req, res) => {
  try {
    const { id, mode } = req.params;
    const question = await QuizQuestion.findOne({
      id: Number(id),
      mode
    });

    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all levels for a game mode
router.get("/levels/:mode", async (req, res) => {
  try {
    const { mode } = req.params;
    console.log(`[API] Fetching levels for mode: ${mode}`);
    
    // Get all questions for this mode
    const questions = await QuizQuestion.find({ mode });
    
    console.log(`[API] Found ${questions.length} questions for ${mode}`);
    
    // Log sample data for debugging
    if (questions.length > 0) {
      console.log(`[API] Sample question structure:`, {
        id: questions[0].id,
        title: questions[0].title,
        difficulty: questions[0].difficulty,
        hasOptions: !!questions[0].options,
        optionsCount: questions[0].options?.length || 0,
        sampleOption: questions[0].options?.[0] || null
      });
    }
    
    res.json(questions);
  } catch (err) {
    console.error(`[API] Error fetching levels for ${mode}:`, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;