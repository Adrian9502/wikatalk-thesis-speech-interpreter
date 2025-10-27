const User = require("../models/user.model");
const Translation = require("../models/translation.model");
const UserProgress = require("../models/userProgress.model");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalTranslations = await Translation.countDocuments();
    const totalGameAttempts = await UserProgress.countDocuments();

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo },
    });

    // Calculate growth rates
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // User growth
    const newUsersLast30 = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const newUsersPrevious30 = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });
    const userGrowth =
      newUsersPrevious30 > 0
        ? ((newUsersLast30 - newUsersPrevious30) / newUsersPrevious30) * 100
        : newUsersLast30 > 0
          ? 100
          : 0;

    // Translation growth
    const translationsLast30 = await Translation.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const translationsPrevious30 = await Translation.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });
    const translationGrowth =
      translationsPrevious30 > 0
        ? ((translationsLast30 - translationsPrevious30) /
          translationsPrevious30) *
        100
        : translationsLast30 > 0
          ? 100
          : 0;

    // Game activity growth
    const gameAttemptsLast30 = await UserProgress.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const gameAttemptsPrevious30 = await UserProgress.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });
    const gameGrowth =
      gameAttemptsPrevious30 > 0
        ? ((gameAttemptsLast30 - gameAttemptsPrevious30) /
          gameAttemptsPrevious30) *
        100
        : gameAttemptsLast30 > 0
          ? 100
          : 0;

    // Recent activity (last 5 user registrations)
    const recentUsers = await User.find()
      .select("fullName createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // Format recent activity
    const recentActivity = recentUsers.map((user) => {
      const timeDiff = Date.now() - new Date(user.createdAt).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      let timeAgo;
      if (minutesAgo < 60) {
        timeAgo = `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`;
      } else if (hoursAgo < 24) {
        timeAgo = `${hoursAgo} hour${hoursAgo !== 1 ? "s" : ""} ago`;
      } else {
        timeAgo = `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;
      }

      return {
        id: user._id,
        user: user.fullName,
        action: "joined WikaTalk",
        time: timeAgo,
      };
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTranslations,
        totalGameAttempts,
        userGrowth: parseFloat(userGrowth.toFixed(1)),
        translationGrowth: parseFloat(translationGrowth.toFixed(1)),
        gameGrowth: parseFloat(gameGrowth.toFixed(1)),
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;

    console.log("getAllUsers called with params:", { page, limit, search, role });

    const query = {};

    // Search by name, email, or username
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role with fallback for missing role field
    if (role && role.trim() !== "") {
      const normalizedRole = role.trim().toLowerCase();
      console.log("Filtering by role:", normalizedRole);

      if (normalizedRole === "user") {
        // For "user" role, include:
        // 1. Documents where role === "user"
        // 2. Documents where role field doesn't exist (legacy users)
        // 3. Documents where role is null/undefined
        query.$or = query.$or
          ? [
            ...query.$or,
            { role: "user" },
            { role: { $exists: false } },
            { role: null },
          ]
          : [{ role: "user" }, { role: { $exists: false } }, { role: null }];
      } else {
        // For admin/superadmin, match exact role
        query.role = normalizedRole;
      }
    }

    console.log("Final query:", JSON.stringify(query, null, 2));

    const users = await User.find(query)
      .select("-password -verificationCode -resetPasswordCode -deletionCode")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    console.log(`Found ${count} users matching query`);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -verificationCode -resetPasswordCode -deletionCode"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { fullName, username, email, isVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if username or email already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!["user", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing own role
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    user.isAdmin = role === "admin" || role === "superadmin";
    await user.save();

    res.json({
      success: true,
      message: `User role changed to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error("Change user role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting own account
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting super admin accounts (extra security)
    if (user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin accounts",
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Toggle user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
exports.toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isVerified ? "verified" : "unverified"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Toggle verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats/users
// @access  Private (Admin only)
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get translation statistics
// @route   GET /api/admin/stats/translations
// @access  Private (Admin only)
exports.getTranslationStats = async (req, res) => {
  try {
    const totalTranslations = await Translation.countDocuments();

    const languageStats = await Translation.aggregate([
      {
        $group: {
          _id: "$targetLanguage",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        total: totalTranslations,
        byLanguage: languageStats,
      },
    });
  } catch (error) {
    console.error("Get translation stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get game statistics
// @route   GET /api/admin/stats/games
// @access  Private (Admin only)
exports.getGameStats = async (req, res) => {
  try {
    const totalAttempts = await UserProgress.countDocuments();

    const completionStats = await UserProgress.aggregate([
      {
        $group: {
          _id: "$completed",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalAttempts,
        completionStats,
      },
    });
  } catch (error) {
    console.error("Get game stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get feedback list
// @route   GET /api/admin/feedback
// @access  Private (Admin only)
exports.getFeedbackList = async (req, res) => {
  try {
    // You'll need to create a Feedback model or use existing user feedback
    // This is a placeholder
    res.json({
      success: true,
      data: [],
      message: "Feedback endpoint coming soon",
    });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};