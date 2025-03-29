const express = require("express");
const router = express.Router();
const { processAudio } = require("../controllers/audio.controller");
const multer = require("multer");

// Configure multer for memory storage (no file system use)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/process", upload.single("file"), processAudio);

module.exports = router;
