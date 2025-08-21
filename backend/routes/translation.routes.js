const express = require("express");
const router = express.Router();
const {
  saveTranslation,
  getTranslationHistory,
  deleteTranslation,
  clearTranslationHistory,
} = require("../controllers/translation.controller");
const { protect } = require("../middleware/auth.middleware");

// Protected routes - require authentication
router.post("/", protect, saveTranslation);
router.get("/", protect, getTranslationHistory);
router.delete("/:id", protect, deleteTranslation);

router.delete("/", protect, clearTranslationHistory);

module.exports = router;