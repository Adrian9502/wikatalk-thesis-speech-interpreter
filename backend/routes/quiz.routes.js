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
    const questions = await QuizQuestion.find({ mode });
    res.json(questions);
  } catch (err) {
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
    // Just get the ids, difficulties, and titles for level selection
    const questions = await QuizQuestion.find({ mode }).select('id level difficulty title');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;