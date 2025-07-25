const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const UserProgress = require("../models/userProgress.model");
const User = require("../models/user.model");
// Add the reset cost calculation function
const calculateResetCost = (secondsSpent) => {
  if (secondsSpent <= 30) return 50;         // 0–30 sec → 50 coins
  if (secondsSpent <= 120) return 60;        // 30s – 2 mins → 60 coins
  if (secondsSpent <= 300) return 70;        // 2 – 5 mins → 70 coins
  if (secondsSpent <= 600) return 85;        // 5 – 10 mins → 85 coins
  if (secondsSpent <= 1200) return 100;      // 10 – 20 mins → 100 coins
  return 120;                                // 20+ mins → 120 coins
};

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

    // FIXED: Don't create new progress in GET route
    // Just return a "not found" response that frontend can handle
    console.log("[PROGRESS] No progress found for quiz:", quizId);
    return res.json({
      success: true,
      progress: null,
      message: "No progress found for this quiz"
    });

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

    // FIXED: Restructure update to avoid conflicts
    const updateData = {
      $setOnInsert: {
        // Only set these fields when creating a new document
        userId,
        quizId,
        exercisesCompleted: 0,
        totalExercises: 1,
        completed: false,
        totalTimeSpent: 0,
        attempts: []
      }
    };

    // Add new attempt if time spent is provided
    if (timeSpent !== undefined) {
      const timeSpentNum = parseFloat(timeSpent);

      if (!isNaN(timeSpentNum)) {
        // First, get the current progress to calculate attempt number
        const existingProgress = await UserProgress.findOne({ userId, quizId });
        const attemptNumber = existingProgress ? (existingProgress.attempts.length + 1) : 1;

        // Create the new attempt record
        const newAttempt = {
          quizId,
          timeSpent: timeSpentNum,
          attemptDate: new Date(),
          isCorrect: isCorrect || false,
          attemptNumber: attemptNumber,
          cumulativeTime: timeSpentNum
        };

        // Add the attempt to the update
        updateData.$push = { attempts: newAttempt };

        // FIXED: Initialize $set properly to avoid conflicts
        updateData.$set = {
          totalTimeSpent: timeSpentNum,
          lastAttemptTime: timeSpentNum,
          lastAttemptDate: new Date()
        };

        console.log("[PROGRESS] Adding attempt with time:", timeSpentNum, "isCorrect:", isCorrect);
      }
    }

    // FIXED: Handle completion status separately to avoid conflicts
    if (completed !== undefined) {
      // Ensure $set exists
      if (!updateData.$set) {
        updateData.$set = {};
      }

      // Only set completed if it's not already set in $setOnInsert
      updateData.$set.completed = completed;

      if (completed) {
        updateData.$set.exercisesCompleted = 1; // Assuming 1 exercise per quiz
        console.log("[PROGRESS] Marking quiz as completed");
      }
    }

    // FIXED: Use findOneAndUpdate with upsert option
    const progress = await UserProgress.findOneAndUpdate(
      { userId, quizId },
      updateData,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    console.log("[PROGRESS] Progress updated/created successfully");
    res.json({ success: true, progress });

  } catch (error) {
    console.error("[PROGRESS] Error updating progress:", error);

    // ENHANCED: Better error handling for different types of conflicts
    if (error.code === 11000) {
      console.log("[PROGRESS] Duplicate key error, attempting to update existing record");

      try {
        // If we get a duplicate key error, just update the existing record
        const existingProgress = await UserProgress.findOne({
          userId: req.user._id,
          quizId: req.params.quizId.replace('n-', '')
        });

        if (existingProgress) {
          // Update the existing record
          if (req.body.timeSpent !== undefined) {
            const timeSpentNum = parseFloat(req.body.timeSpent);
            if (!isNaN(timeSpentNum)) {
              existingProgress.attempts.push({
                quizId: existingProgress.quizId,
                timeSpent: timeSpentNum,
                attemptDate: new Date(),
                isCorrect: req.body.isCorrect || false,
                attemptNumber: existingProgress.attempts.length + 1,
                cumulativeTime: timeSpentNum
              });
              existingProgress.totalTimeSpent = timeSpentNum;
              existingProgress.lastAttemptTime = timeSpentNum;
              existingProgress.lastAttemptDate = new Date();
            }
          }

          if (req.body.completed !== undefined) {
            existingProgress.completed = req.body.completed;
            if (req.body.completed) {
              existingProgress.exercisesCompleted = 1;
            }
          }

          await existingProgress.save();
          return res.json({ success: true, progress: existingProgress });
        }
      } catch (retryError) {
        console.error("[PROGRESS] Retry failed:", retryError);
      }
    } else if (error.code === 40) {
      // FIXED: Handle ConflictingUpdateOperators error
      console.log("[PROGRESS] ConflictingUpdateOperators error, using direct update approach");

      try {
        // Find the existing document and update it directly
        const existingProgress = await UserProgress.findOne({
          userId: req.user._id,
          quizId: req.params.quizId.replace('n-', '')
        });

        if (existingProgress) {
          // Update fields individually to avoid conflicts
          if (req.body.timeSpent !== undefined) {
            const timeSpentNum = parseFloat(req.body.timeSpent);
            if (!isNaN(timeSpentNum)) {
              // Add new attempt
              existingProgress.attempts.push({
                quizId: existingProgress.quizId,
                timeSpent: timeSpentNum,
                attemptDate: new Date(),
                isCorrect: req.body.isCorrect || false,
                attemptNumber: existingProgress.attempts.length + 1,
                cumulativeTime: timeSpentNum
              });

              // Update other fields
              existingProgress.totalTimeSpent = timeSpentNum;
              existingProgress.lastAttemptTime = timeSpentNum;
              existingProgress.lastAttemptDate = new Date();
            }
          }

          // Update completion status
          if (req.body.completed !== undefined) {
            existingProgress.completed = req.body.completed;
            if (req.body.completed) {
              existingProgress.exercisesCompleted = 1;
            }
          }

          // Save the updated document
          const updatedProgress = await existingProgress.save();
          return res.json({ success: true, progress: updatedProgress });

        } else {
          // Create new document if none exists
          const newProgress = new UserProgress({
            userId: req.user._id,
            quizId: req.params.quizId.replace('n-', ''),
            exercisesCompleted: req.body.completed ? 1 : 0,
            totalExercises: 1,
            completed: req.body.completed || false,
            totalTimeSpent: parseFloat(req.body.timeSpent) || 0,
            lastAttemptTime: parseFloat(req.body.timeSpent) || 0,
            attempts: req.body.timeSpent ? [{
              quizId: req.params.quizId.replace('n-', ''),
              timeSpent: parseFloat(req.body.timeSpent),
              attemptDate: new Date(),
              isCorrect: req.body.isCorrect || false,
              attemptNumber: 1,
              cumulativeTime: parseFloat(req.body.timeSpent)
            }] : [],
            lastAttemptDate: new Date()
          });

          const savedProgress = await newProgress.save();
          return res.json({ success: true, progress: savedProgress });
        }
      } catch (directUpdateError) {
        console.error("[PROGRESS] Direct update failed:", directUpdateError);
      }
    }

    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/userprogress/:quizId/reset-timer
 * @desc    Reset timer for a quiz (dynamic cost based on time spent)
 * @access  Private
 */
router.post("/:quizId/reset-timer", protect, async (req, res) => {
  try {
    console.log("[PROGRESS] Reset timer request for quiz:", req.params.quizId);
    const userId = req.user._id;
    let { quizId } = req.params;

    // Handle numeric ID format with prefix
    if (quizId.startsWith('n-')) {
      quizId = quizId.replace('n-', '');
      console.log("[PROGRESS] Converted numeric ID to:", quizId);
    }

    // Find existing progress
    const existingProgress = await UserProgress.findOne({ userId, quizId });

    if (!existingProgress) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this quiz"
      });
    }

    // Don't allow reset if already completed
    if (existingProgress.completed) {
      return res.status(400).json({
        success: false,
        message: "Cannot reset timer for completed levels"
      });
    }

    // UPDATED: Calculate dynamic cost based on time spent
    const timeSpent = existingProgress.totalTimeSpent || 0;
    const RESET_COST = calculateResetCost(timeSpent);

    console.log(`[PROGRESS] Calculated reset cost for ${timeSpent}s: ${RESET_COST} coins`);

    // Check if user has enough coins
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.coins < RESET_COST) {
      return res.status(400).json({
        success: false,
        message: `Insufficient coins. You need ${RESET_COST} coins to reset the timer.`,
        currentCoins: user.coins,
        requiredCoins: RESET_COST,
        timeSpent: timeSpent,
        costBreakdown: {
          baseMessage: getResetCostMessage(timeSpent),
          timeRange: getTimeRangeMessage(timeSpent)
        }
      });
    }

    // Reset the timer fields
    existingProgress.totalTimeSpent = 0;
    existingProgress.lastAttemptTime = 0;
    existingProgress.lastAttemptDate = new Date();

    // Clear all attempts (optional - keeps history but resets timer)
    existingProgress.attempts = [];

    // Save the updated progress
    await existingProgress.save();

    // Deduct coins from user
    user.coins -= RESET_COST;
    await user.save();

    console.log(`[PROGRESS] Timer reset successfully for quiz ${quizId}, ${RESET_COST} coins deducted`);

    res.json({
      success: true,
      message: "Timer reset successfully!",
      progress: existingProgress,
      coinsDeducted: RESET_COST,
      remainingCoins: user.coins,
      costBreakdown: {
        originalTimeSpent: timeSpent,
        costReason: getResetCostMessage(timeSpent),
        timeRange: getTimeRangeMessage(timeSpent)
      }
    });

  } catch (error) {
    console.error("[PROGRESS] Error resetting timer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset timer"
    });
  }
});

// Helper functions for backend
function getResetCostMessage(secondsSpent) {
  if (secondsSpent <= 30) return "Quick reset (under 30 seconds)";
  if (secondsSpent <= 120) return "Short session (under 2 minutes)";
  if (secondsSpent <= 300) return "Medium session (2-5 minutes)";
  if (secondsSpent <= 600) return "Long session (5-10 minutes)";
  if (secondsSpent <= 1200) return "Extended session (10-20 minutes)";
  return "Very long session (over 20 minutes)";
}

function getTimeRangeMessage(secondsSpent) {
  if (secondsSpent <= 30) return "0-30s";
  if (secondsSpent <= 120) return "30s-2m";
  if (secondsSpent <= 300) return "2-5m";
  if (secondsSpent <= 600) return "5-10m";
  if (secondsSpent <= 1200) return "10-20m";
  return "20m+";
}

module.exports = router;