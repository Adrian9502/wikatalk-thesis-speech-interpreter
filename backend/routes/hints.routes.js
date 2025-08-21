const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require("../models/user.model");
const {
  getNextHintCost,
  canPurchaseHint,
  getMaxHintsForGameMode,
  getHintPricing
} = require("../utils/hintUtils");

/**
 * GET /api/hints/cost/:hintNumber/:gameMode
 * Get cost for a specific hint number in specific game mode
 */
router.get("/cost/:hintNumber/:gameMode", protect, async (req, res) => {
  try {
    const { hintNumber, gameMode } = req.params;
    const hintNum = parseInt(hintNumber);
    const maxHints = getMaxHintsForGameMode(gameMode);

    if (hintNum < 1 || hintNum > maxHints) {
      return res.status(400).json({
        success: false,
        message: `Invalid hint number for ${gameMode}. Must be between 1 and ${maxHints}`
      });
    }

    const cost = getNextHintCost(hintNum - 1, gameMode);

    res.json({
      success: true,
      hintNumber: hintNum,
      cost,
      maxHints,
      gameMode
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
 * GET /api/hints/pricing/:gameMode
 * Get all hint pricing for a specific game mode
 */
router.get("/pricing/:gameMode", protect, async (req, res) => {
  try {
    const { gameMode } = req.params;
    const pricing = getHintPricing(gameMode);
    const maxHints = getMaxHintsForGameMode(gameMode);

    res.json({
      success: true,
      gameMode,
      maxHints,
      pricing
    });
  } catch (error) {
    console.error("Error getting hint pricing:", error);
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

    // Check if hint can be purchased for this game mode
    const hintValidation = canPurchaseHint(user.coins, currentHintsUsed, gameMode);
    if (!hintValidation.canPurchase) {
      return res.status(400).json({
        success: false,
        message: hintValidation.reason,
        userCoins: user.coins,
        hintsUsed: currentHintsUsed,
        gameMode,
        maxHints: getMaxHintsForGameMode(gameMode),
        coinsNeeded: hintValidation.coinsNeeded || 0
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
      maxHints: getMaxHintsForGameMode(gameMode),
      hintsRemaining: hintValidation.hintsRemaining,
      nextHintCost: getNextHintCost(currentHintsUsed + 1, gameMode)
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
 * GET /api/hints/status/:gameMode
 * Get user's hint usage status for specific game mode
 */
router.get("/status/:gameMode", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameMode } = req.params;
    const user = await User.findById(userId).select("coins hintUsage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const maxHints = getMaxHintsForGameMode(gameMode);

    res.json({
      success: true,
      coins: user.coins,
      hintUsage: user.hintUsage,
      maxHints,
      gameMode
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