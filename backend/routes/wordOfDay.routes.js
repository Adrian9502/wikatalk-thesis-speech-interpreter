const express = require("express");
const router = express.Router();
const wordOfDayController = require("../controllers/wordOfDay.controller");
const { protect } = require("../middleware/auth.middleware");

// Public endpoint - no auth required
router.get("/", wordOfDayController.getWordOfTheDay);

module.exports = router;