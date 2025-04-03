const express = require("express");
const router = express.Router();
const {
  saveTranslation,
  getTranslations,
  deleteTranslation,
} = require("../controllers/translation.controller");
const { protect } = require("../middleware/auth.middleware");

// Protected routes - require authentication
router.post("/", protect, saveTranslation);
router.get("/", protect, getTranslations);
router.delete("/:id", protect, deleteTranslation);

module.exports = router;
