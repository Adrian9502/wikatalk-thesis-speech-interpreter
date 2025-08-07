const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const UserProgress = require("../models/userProgress.model");
const User = require("../models/user.model");

// NEW: Import reward calculation function
const { calculateRewardCoins } = require("../utils/rewardCalculationUtils");

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
  try {
    const userId = req.user._id;
    let quizId = req.params.quizId;
    const { timeSpent, completed, isCorrect, difficulty } = req.body;

    // Handle numeric ID format
    if (quizId.startsWith('n-')) {
      quizId = quizId.replace('n-', '');
      console.log("[PROGRESS] Converted numeric ID to:", quizId);
    }

    // Validate required fields
    const timeSpentNum = parseFloat(timeSpent);
    if (isNaN(timeSpentNum) || timeSpentNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid timeSpent value"
      });
    }

    // Validate difficulty for reward calculation
    if (isCorrect && !difficulty) {
      console.warn("[PROGRESS] No difficulty provided for correct answer, defaulting to 'easy'");
    }

    console.log(`[PROGRESS] Processing: timeSpent=${timeSpentNum}, completed=${completed}, isCorrect=${isCorrect}, difficulty=${difficulty || 'easy'}`);

    // Calculate reward for correct answers
    let rewardCoins = 0;
    let rewardInfo = null;
    
    if (isCorrect) {
      const rewardCalculation = calculateRewardCoins(difficulty || 'easy', timeSpentNum, true);
      rewardCoins = rewardCalculation.coins;
      rewardInfo = {
        coins: rewardCalculation.coins,
        label: rewardCalculation.label,
        difficulty: difficulty || 'easy',
        timeSpent: timeSpentNum,
        tier: rewardCalculation.tier
      };
      
      console.log(`[PROGRESS] Reward calculated: ${rewardCoins} coins for ${difficulty || 'easy'} difficulty in ${timeSpentNum}s`);
    }

    // Find existing progress or create new
    let existingProgress = await UserProgress.findOne({ userId, quizId });

    if (!existingProgress) {
      console.log("[PROGRESS] Creating new progress entry");
      existingProgress = new UserProgress({
        userId,
        quizId,
        exercisesCompleted: completed ? 1 : 0,
        totalTimeSpent: timeSpentNum,
        lastAttemptTime: timeSpentNum,
        lastAttemptDate: new Date(),
        completed: completed || false,
        attempts: timeSpentNum > 0 ? [{
          quizId: quizId,
          attemptDate: new Date(),
          timeSpent: timeSpentNum,
          isCorrect: isCorrect || false,
          attemptNumber: 1,
          cumulativeTime: timeSpentNum,
          rewardEarned: rewardCoins // NEW: Track reward earned
        }] : []
      });

      await existingProgress.save();

      // Award coins to user for correct answers
      if (rewardCoins > 0) {
        await User.findByIdAndUpdate(
          userId,
          { $inc: { coins: rewardCoins } },
          { new: true }
        );
        console.log(`[PROGRESS] Awarded ${rewardCoins} coins to user for correct answer`);
      }

      return res.json({ 
        success: true, 
        progress: existingProgress,
        reward: rewardInfo // NEW: Include reward info in response
      });
    }

    // Update existing progress with retry logic
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Only update if time > 0
        if (timeSpentNum > 0) {
          // FIXED: Add the missing quizId field here too
          existingProgress.attempts.push({
            quizId: quizId, // ADD THIS LINE
            attemptDate: new Date(),
            timeSpent: timeSpentNum,
            isCorrect: isCorrect || false,
            attemptNumber: existingProgress.attempts.length + 1,
            cumulativeTime: timeSpentNum,
            rewardEarned: rewardCoins // NEW: Track reward earned
          });
          existingProgress.totalTimeSpent = timeSpentNum;
          existingProgress.lastAttemptTime = timeSpentNum;
          existingProgress.lastAttemptDate = new Date();
        }

        if (completed !== undefined) {
          existingProgress.completed = completed;
          if (completed) {
            existingProgress.exercisesCompleted = 1;
          }
        }

        await existingProgress.save();

        // Award coins to user for correct answers
        if (rewardCoins > 0) {
          await User.findByIdAndUpdate(
            userId,
            { $inc: { coins: rewardCoins } },
            { new: true }
          );
          console.log(`[PROGRESS] Awarded ${rewardCoins} coins to user for correct answer`);
        }

        return res.json({ 
          success: true, 
          progress: existingProgress,
          reward: rewardInfo // NEW: Include reward info in response
        });
      } catch (retryError) {
        if (attempt === maxRetries - 1) {
          throw retryError;
        }
        console.log(`[PROGRESS] Retry ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Refetch the document for next attempt
        existingProgress = await UserProgress.findOne({ userId, quizId });
        if (!existingProgress) {
          throw new Error("Progress document was deleted during update");
        }
      }
    }
  } catch (error) {
    console.error("[PROGRESS] Error updating progress:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating progress",
      error: error.message 
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