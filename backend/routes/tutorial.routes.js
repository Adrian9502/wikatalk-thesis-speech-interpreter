const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

// Get user's tutorial status
router.get("/status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tutorialStatus = user.getTutorialStatus();

    res.json({
      success: true,
      data: tutorialStatus,
    });
  } catch (error) {
    console.error("Get tutorial status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting tutorial status"
    });
  }
});

// Mark tutorial as completed
router.post("/complete", protect, async (req, res) => {
  try {
    const { tutorialName, version = 1 } = req.body;

    // Validate tutorial name
    const validTutorials = ['home', 'speech', 'translate', 'scan', 'games', 'pronounce'];
    if (!validTutorials.includes(tutorialName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutorial name",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Mark tutorial as seen
    await user.markTutorialAsSeen(tutorialName, version);

    // Get updated status
    const updatedStatus = user.getTutorialStatus();

    res.json({
      success: true,
      message: `${tutorialName} tutorial marked as completed`,
      data: updatedStatus,
    });
  } catch (error) {
    console.error("Complete tutorial error:", error);
    res.status(500).json({
      success: false,
      message: "Server error completing tutorial"
    });
  }
});

// Check if specific tutorial should be shown
router.get("/should-show/:tutorialName", protect, async (req, res) => {
  try {
    const { tutorialName } = req.params;
    const { version = 1 } = req.query;

    // Validate tutorial name
    const validTutorials = ['home', 'speech', 'translate', 'scan', 'games', 'pronounce'];
    if (!validTutorials.includes(tutorialName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutorial name",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const shouldShow = user.shouldShowTutorial(tutorialName, parseInt(version));

    res.json({
      success: true,
      data: {
        shouldShow,
        tutorialName,
        version: parseInt(version),
      },
    });
  } catch (error) {
    console.error("Check tutorial error:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking tutorial"
    });
  }
});

// Reset user tutorials (admin or user action)
router.post("/reset", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Reset all tutorials
    user.appTutorial = {
      home: { hasSeen: false, version: 1, completedAt: null },
      speech: { hasSeen: false, version: 1, completedAt: null },
      translate: { hasSeen: false, version: 1, completedAt: null },
      scan: { hasSeen: false, version: 1, completedAt: null },
      games: { hasSeen: false, version: 1, completedAt: null },
      pronounce: { hasSeen: false, version: 1, completedAt: null },
    };

    await user.save();

    res.json({
      success: true,
      message: "All tutorials have been reset",
      data: user.getTutorialStatus(),
    });
  } catch (error) {
    console.error("Reset tutorials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error resetting tutorials"
    });
  }
});

module.exports = router;