const express = require("express");
const router = express.Router();
const pronunciationController = require("../controllers/pronunciation.controller");

router.get("/", pronunciationController.getAllPronunciations);

module.exports = router;