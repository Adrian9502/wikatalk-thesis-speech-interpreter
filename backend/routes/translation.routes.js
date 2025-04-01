const express = require("express");
const router = express.Router();
const {
  saveTranslation,
  getTranslations,
  deleteTranslation,
} = require("../controllers/translation.controller");

// Routes for translations
router.post("/", saveTranslation);
router.get("/", getTranslations);
router.delete("/:id", deleteTranslation);

module.exports = router;
