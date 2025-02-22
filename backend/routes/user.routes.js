const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyEmail,
  resendVerificationCode,
  checkVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/check-verification", checkVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-verification-code", resendVerificationCode);

// Protected routes
router.get("/profile", protect, getUserProfile);

module.exports = router;
