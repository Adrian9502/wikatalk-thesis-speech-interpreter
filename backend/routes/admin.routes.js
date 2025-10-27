const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { adminOnly, superAdminOnly } = require("../middleware/admin.middleware");
const {
  adminLogin,
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUser,
  changeUserRole,
  deleteUser,
  toggleUserVerification,
  getUserStats,
  getTranslationStats,
  getGameStats,
  getFeedbackList,
} = require("../controllers/admin.controller");

// Admin login (public)
router.post("/login", adminLogin);

// Protected admin routes (require authentication + admin role)
router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUser);
router.put("/users/:id/verify", protect, adminOnly, toggleUserVerification);

// Super admin only routes
router.put("/users/:id/role", protect, superAdminOnly, changeUserRole);
router.delete("/users/:id", protect, superAdminOnly, deleteUser);

// Statistics routes
router.get("/stats/users", protect, adminOnly, getUserStats);
router.get("/stats/translations", protect, adminOnly, getTranslationStats);
router.get("/stats/games", protect, adminOnly, getGameStats);
router.get("/feedback", protect, adminOnly, getFeedbackList);

module.exports = router;