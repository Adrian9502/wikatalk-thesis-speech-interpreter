const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const UserProgress = require("../models/userProgress.model");

// More detailed logging for routes
router.use((req, res, next) => {
  console.log(`[PROGRESS_ROUTE] ${req.method} ${req.originalUrl}`);
  console.log(`[PROGRESS_ROUTE] Params:`, req.params);
  console.log(`[PROGRESS_ROUTE] Query:`, req.query);
  console.log(`[PROGRESS_ROUTE] Body:`, req.body);
  next();
});

// Test route to verify the router is working
router.get("/test", (req, res) => {
  console.log("[PROGRESS] Test route hit successfully");
  res.json({
    success: true,
    message: "UserProgress routes are working correctly",
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/userprogress
 * @desc    Get all progress for current user
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    console.log("[PROGRESS] Getting all progress for user:", req.user._id);
    const progressEntries = await UserProgress.find({ userId: req.user._id });

    const summary = {
      totalQuizzes: progressEntries.length,
      completedQuizzes: progressEntries.filter(p => p.completed).length,
      totalTimeSpent: progressEntries.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0)
    };

    res.json({ success: true, progressEntries, summary });
  } catch (error) {
    console.error("[PROGRESS] Error getting all progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/userprogress/:quizId
 * @desc    Get progress for a specific quiz
 * @access  Private
 */
router.get("/:quizId", protect, async (req, res) => {
  try {
    console.log("[PROGRESS] Route handler triggered for GET /:quizId");
    const userId = req.user._id;
    let { quizId } = req.params;

    console.log("[PROGRESS] Getting progress for quiz:", quizId, "user:", userId);

    // Handle numeric ID format with prefix instead of slash
    if (quizId.startsWith('n-')) {
      quizId = quizId.replace('n-', '');
      console.log("[PROGRESS] Converted numeric ID to:", quizId);
    }

    // Find existing progress
    let progress = await UserProgress.findOne({
      userId,
      quizId
    });

    if (progress) {
      console.log("[PROGRESS] Found existing progress for quiz:", quizId);
      return res.json({ success: true, progress });
    }

    // No progress found, create a new document
    console.log("[PROGRESS] Creating new progress for quiz:", quizId);

    progress = new UserProgress({
      userId,
      quizId,
      exercisesCompleted: 0,
      totalExercises: 1,
      completed: false,
      totalTimeSpent: 0,
      attempts: []
    });

    await progress.save();
    console.log("[PROGRESS] New progress saved successfully");

    res.json({ success: true, progress });
  } catch (error) {
    console.error("[PROGRESS] Error getting quiz progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/userprogress/:quizId
 * @desc    Update progress for a quiz
 * @access  Private
 */
router.post("/:quizId", protect, async (req, res) => {
  try {
    console.log("[PROGRESS] Route handler triggered for POST /:quizId");
    const userId = req.user._id;
    let { quizId } = req.params;
    const { timeSpent, completed, isCorrect } = req.body; 

    console.log("[PROGRESS] Updating progress for quiz:", quizId);
    console.log("[PROGRESS] Time spent:", timeSpent, "Completed:", completed, "Is correct:", isCorrect);

    // Handle numeric ID format with prefix
    if (quizId.startsWith('n-')) {
      quizId = quizId.replace('n-', '');
      console.log("[PROGRESS] Converted numeric ID to:", quizId);
    }

    // Find or create progress
    let progress = await UserProgress.findOne({ userId, quizId });

    if (!progress) {
      console.log("[PROGRESS] Creating new progress document");
      progress = new UserProgress({
        userId,
        quizId,
        exercisesCompleted: 0,
        totalExercises: 1,
        completed: false,
        totalTimeSpent: 0,
        attempts: []
      });
    }

    // Add new attempt if time spent is provided
    if (timeSpent !== undefined) {
      const timeSpentNum = parseFloat(timeSpent);

      if (!isNaN(timeSpentNum)) {
        // Track attempt numbers and cumulative time
        const attemptNumber = progress.attempts.length + 1;
        const previousTimeSpent = progress.totalTimeSpent || 0;
        
        // Create the new attempt record
        const newAttempt = {
          quizId,
          timeSpent: timeSpentNum,
          attemptDate: new Date(),
          isCorrect: isCorrect || false,
          attemptNumber: attemptNumber,
          cumulativeTime: timeSpentNum  // This is the TOTAL time, not just this attempt
        };

        progress.attempts.push(newAttempt);
        
        // Store original time in database - this should be the absolute time, not a difference
        progress.totalTimeSpent = timeSpentNum; 
        progress.lastAttemptTime = timeSpentNum;
        progress.lastAttemptDate = new Date();

        console.log("[PROGRESS] Added attempt with time:", timeSpentNum, "isCorrect:", isCorrect);
      }
    }

    // Update completion status if provided
    if (completed !== undefined) {
      progress.completed = completed;

      if (completed) {
        progress.exercisesCompleted = progress.totalExercises;
        console.log("[PROGRESS] Marked quiz as completed");
      }
    }

    await progress.save();
    console.log("[PROGRESS] Progress saved successfully");

    res.json({ success: true, progress });
  } catch (error) {
    console.error("[PROGRESS] Error updating progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;