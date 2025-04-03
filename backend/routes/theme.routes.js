// routes/themeRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUserTheme,
  updateUserTheme,
} = require("../controllers/theme.controller");

const { protect } = require("../middleware/auth.middleware");

// Theme routes
router.get("/", protect, getUserTheme);
router.post("/", protect, updateUserTheme);

module.exports = router;
