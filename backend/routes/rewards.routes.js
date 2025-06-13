const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const DailyReward = require("../models/dailyReward.model");
const User = require("../models/user.model");

// Get daily rewards history
router.get("/daily/history", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user's rewards or create if doesn't exist
    let userRewards = await DailyReward.findOne({ userId });

    if (!userRewards) {
      userRewards = {
        userId,
        claimedDates: []
      };
    }

    res.status(200).json(userRewards);
  } catch (error) {
    console.error("Error fetching daily rewards history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if daily reward is available
router.get("/daily/check", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    // Find user's rewards
    const userRewards = await DailyReward.findOne({ userId });

    // If no record found, reward is available
    if (!userRewards) {
      return res.status(200).json({ available: true });
    }

    // Check if user already claimed reward today
    const claimedToday = userRewards.claimedDates.some(
      claim => new Date(claim.date).toISOString().split('T')[0] === todayFormatted
    );

    res.status(200).json({ available: !claimedToday });
  } catch (error) {
    console.error("Error checking daily reward:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Claim daily reward
router.post("/daily/claim", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    // Find user's rewards
    let userRewards = await DailyReward.findOne({ userId });

    // If no record found, create a new one
    if (!userRewards) {
      userRewards = new DailyReward({ userId, claimedDates: [] });
    }

    // Check if user already claimed reward today
    const claimedToday = userRewards.claimedDates.some(
      claim => new Date(claim.date).toISOString().split('T')[0] === todayFormatted
    );

    if (claimedToday) {
      return res.status(400).json({
        claimed: false,
        message: "Daily reward already claimed today"
      });
    }

    // Calculate reward amount based on day of week
    const dayOfWeek = today.getDay();
    const amount = dayOfWeek === 0 || dayOfWeek === 6 ? 50 : 25; // Weekend vs weekday

    // Add to claimed dates
    userRewards.claimedDates.push({
      date: today,
      amount
    });

    // Save to database
    await userRewards.save();

    // Update user's coins
    await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: amount } },
      { new: true }
    );

    res.status(200).json({
      claimed: true,
      amount,
      message: "Daily reward claimed successfully"
    });
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// route to get user's coins balance
router.get("/coins", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's coins from database
    const user = await User.findById(userId).select("coins");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      coins: user.coins
    });
  } catch (error) {
    console.error("Error fetching user coins:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

module.exports = router;