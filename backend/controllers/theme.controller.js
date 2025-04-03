const User = require("../models/user.model");

exports.getUserTheme = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      theme: user.theme || "Default Navy",
    });
  } catch (error) {
    console.error("Error getting user theme:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve theme",
    });
  }
};

// Update user theme
exports.updateUserTheme = async (req, res) => {
  try {
    const { themeName } = req.body;

    if (!themeName) {
      return res.status(400).json({
        success: false,
        message: "Theme name is required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.theme = themeName;
    await user.save();

    return res.json({
      success: true,
      message: "Theme updated successfully",
      theme: themeName,
    });
  } catch (error) {
    console.error("Error updating user theme:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update theme",
    });
  }
};
