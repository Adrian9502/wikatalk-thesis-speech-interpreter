const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require("../models/user.model");
const {
  getNextHintCost,
  canPurchaseHint,
  MAX_HINTS_PER_QUESTION
} = require("../utils/hintUtils");

/**
 * GET /api/hints/cost/:hintNumber
 * Get cost for a specific hint number
 */
router.get("/cost/:hintNumber", protect, async (req, res) => {
  try {
    const { hintNumber } = req.params;
    const hintNum = parseInt(hintNumber);

    if (hintNum < 1 || hintNum > MAX_HINTS_PER_QUESTION) {
      return res.status(400).json({
        success: false,
        message: `Invalid hint number. Must be between 1 and ${MAX_HINTS_PER_QUESTION}`
      });
    }

    const cost = getNextHintCost(hintNum - 1);

    res.json({
      success: true,
      hintNumber: hintNum,
      cost,
      maxHints: MAX_HINTS_PER_QUESTION
    });
  } catch (error) {
    console.error("Error getting hint cost:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/**
 * POST /api/hints/purchase
 * Purchase a hint for current question
 */
router.post("/purchase", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { questionId, gameMode, currentHintsUsed = 0 } = req.body;

    // Validate required fields
    if (!questionId || !gameMode) {
      return res.status(400).json({
        success: false,
        message: "Question ID and game mode are required"
      });
    }

    // Get user's current coins
    const user = await User.findById(userId).select("coins hintUsage");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if hint can be purchased
    const hintValidation = canPurchaseHint(user.coins, currentHintsUsed);
    if (!hintValidation.canPurchase) {
      return res.status(400).json({
        success: false,
        message: hintValidation.reason,
        userCoins: user.coins,
        hintsUsed: currentHintsUsed
      });
    }

    const hintCost = hintValidation.cost;

    // Deduct coins
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          coins: -hintCost,
          "hintUsage.daily": 1,
          "hintUsage.total": 1
        }
      },
      { new: true }
    ).select("coins hintUsage");

    res.json({
      success: true,
      message: "Hint purchased successfully",
      hintCost,
      remainingCoins: updatedUser.coins,
      hintsUsed: currentHintsUsed + 1,
      nextHintCost: getNextHintCost(currentHintsUsed + 1)
    });

  } catch (error) {
    console.error("Error purchasing hint:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/**
 * GET /api/hints/status
 * Get user's hint usage status
 */
router.get("/status", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("coins hintUsage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      coins: user.coins,
      hintUsage: user.hintUsage,
      maxHintsPerQuestion: MAX_HINTS_PER_QUESTION
    });
  } catch (error) {
    console.error("Error getting hint status:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;