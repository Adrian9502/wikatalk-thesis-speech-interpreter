const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyEmail,
  verifyResetCode,
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
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/resend-verification-code", resendVerificationCode);

// Protected routes
router.get("/profile", protect, getUserProfile);

module.exports = router;
