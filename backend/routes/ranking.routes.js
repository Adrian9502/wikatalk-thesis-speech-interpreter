const express = require('express');
const router = express.Router();
const { getRankings } = require('../controllers/ranking.controller');
const { protect } = require('../middleware/auth.middleware'); 

// Get rankings with optional filtering
router.get('/', protect, getRankings); 

module.exports = router;