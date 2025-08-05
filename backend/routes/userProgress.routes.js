const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const UserProgress = require("../models/userProgress.model");
const User = require("../models/user.model");

// UPDATED: New cost calculation function with your tiers
const calculateResetCost = (secondsSpent) => {
  if (secondsSpent <= 10) return 20;          // 0–10 sec → 20 coins
  if (secondsSpent <= 30) return 40;          // 10–30 sec → 40 coins
  if (secondsSpent <= 60) return 55;          // 30s – 1 min → 55 coins
  if (secondsSpent <= 120) return 70;         // 1 – 2 mins → 70 coins
  if (secondsSpent <= 180) return 90;         // 2 – 3 mins → 90 coins
  if (secondsSpent <= 240) return 100;        // 3 – 4 mins → 100 coins
  return 110;                                 // 4+ mins → 110 coins
};

// More detailed logging for routes
router.use((req, res, next) => {
  console.log(`[USER_PROGRESS] ${req.method} ${req.path}`, {
    params: req.params,
    body: req.body ? Object.keys(req.body) : {},
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

/**
 * @route   GET /api/userprogress
 * @desc    Get all user progress entries
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    console.log("[PROGRESS] Fetching all progress for user:", req.user._id);

    const progressEntries = await UserProgress.find({
      userId: req.user._id
    }).sort({ lastAttemptDate: -1 });

    console.log(`[PROGRESS] Found ${progressEntries.length} progress entries`);

    res.json({
      success: true,
      progressEntries,
      count: progressEntries.length
    });
  } catch (error) {
    console.error("[PROGRESS] Error fetching all progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress data"
    });
  }
});

/**
 * @route   GET /api/userprogress/:quizId
 * @desc    Get user progress for a specific quiz
 * @access  Private
 */
router.get("/:quizId", protect, async (req, res) => {
  try {
    console.log("[PROGRESS] Fetching progress for quiz:", req.params.quizId);
    const userId = req.user._id;
    let { quizId } = req.params;

    // Handle numeric ID format with prefix
    if (quizId.startsWith('n-')) {
      quizId = quizId.replace('n-', '');
      console.log("[PROGRESS] Converted numeric ID to:", quizId);
    }

    const progress = await UserProgress.findOne({ userId, quizId });

    if (!progress) {
      console.log("[PROGRESS] No progress found, returning null");
      return res.json({
        success: true,
        progress: null,
        message: "No progress found for this quiz"
      });
    }

    console.log(`[PROGRESS] Found progress: completed=${progress.completed}, timeSpent=${progress.totalTimeSpent}`);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error("[PROGRESS] Error fetching progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress"
    });
  }
});

/**
 * @route   POST /api/userprogress/:quizId
 * @desc    Update or create user progress for a quiz
 * @access  Private
 */
router.post("/:quizId", protect, async (req, res) => {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PROGRESS] Update attempt ${attempt}/${maxRetries} for quiz:`, req.params.quizId);

      const userId = req.user._id;
      let { quizId } = req.params;
      const { timeSpent, completed, isCorrect } = req.body;

      // Handle numeric ID format
      if (quizId.startsWith('n-')) {
        quizId = quizId.replace('n-', '');
        console.log("[PROGRESS] Converted numeric ID to:", quizId);
      }

      // Validate timeSpent
      const timeSpentNum = parseFloat(timeSpent);
      if (isNaN(timeSpentNum) || timeSpentNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid timeSpent value"
        });
      }

      console.log(`[PROGRESS] Processing: timeSpent=${timeSpentNum}, completed=${completed}, isCorrect=${isCorrect}`);

      // Find existing progress or create new
      let existingProgress = await UserProgress.findOne({ userId, quizId });

      if (!existingProgress) {
        console.log("[PROGRESS] Creating new progress entry");
        existingProgress = new UserProgress({
          userId,
          quizId,
          exercisesCompleted: completed ? 1 : 0,
          totalExercises: 1,
          completed: completed || false,
          totalTimeSpent: timeSpentNum,
          lastAttemptTime: timeSpentNum,
          lastAttemptDate: new Date(),
          attempts: []
        });
      } else {
        console.log(`[PROGRESS] Updating existing progress: current completed=${existingProgress.completed}`);

        // Only update time if it's not already completed OR if this is a reset scenario
        if (!existingProgress.completed || timeSpentNum === 0) {
          // Add attempt if time > 0
          if (timeSpentNum > 0) {
            console.log(`[PROGRESS] Adding attempt with time: ${timeSpentNum}`);
            existingProgress.attempts.push({
              quizId: quizId,
              attemptDate: new Date(),
              timeSpent: timeSpentNum,
              isCorrect: isCorrect || false,
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
      }

      await existingProgress.save();
      return res.json({ success: true, progress: existingProgress });

    } catch (error) {
      console.error(`[PROGRESS] Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.error("[PROGRESS] All retry attempts failed");
        break;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

      // Try again
      try {
        const existingProgress = await UserProgress.findOne({
          userId: req.user._id,
          quizId: req.params.quizId.replace('n-', '')
        });

        if (existingProgress) {
          const timeSpentNum = parseFloat(req.body.timeSpent) || 0;

          // Only update if time > 0
          if (timeSpentNum > 0) {
            // FIXED: Add the missing quizId field here too
            existingProgress.attempts.push({
              quizId: req.params.quizId.replace('n-', ''), // ADD THIS LINE
              attemptDate: new Date(),
              timeSpent: timeSpentNum,
              isCorrect: req.body.isCorrect || false,
              attemptNumber: existingProgress.attempts.length + 1,
              cumulativeTime: timeSpentNum
            });
            existingProgress.totalTimeSpent = timeSpentNum;
            existingProgress.lastAttemptTime = timeSpentNum;
            existingProgress.lastAttemptDate = new Date();
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
    }

    // FIXED: Proper error handling at the end of the loop
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update progress after all retries"
    });
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

    // UPDATED: Calculate dynamic cost based on time spent using new tiers
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

// UPDATED: Helper functions for backend with new tiers
function getResetCostMessage(secondsSpent) {
  if (secondsSpent <= 10) return "Ultra quick reset (under 10 seconds)";
  if (secondsSpent <= 30) return "Quick reset (10-30 seconds)";
  if (secondsSpent <= 60) return "Short session (30s - 1 minute)";
  if (secondsSpent <= 120) return "Medium session (1-2 minutes)";
  if (secondsSpent <= 180) return "Long session (2-3 minutes)";
  if (secondsSpent <= 240) return "Extended session (3-4 minutes)";
  return "Very long session (over 4 minutes)";
}

function getTimeRangeMessage(secondsSpent) {
  if (secondsSpent <= 10) return "0-10s";
  if (secondsSpent <= 30) return "10-30s";
  if (secondsSpent <= 60) return "30s-1m";
  if (secondsSpent <= 120) return "1-2m";
  if (secondsSpent <= 180) return "2-3m";
  if (secondsSpent <= 240) return "3-4m";
  return "4m+";
}

module.exports = router;