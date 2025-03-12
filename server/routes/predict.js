const express = require('express');
const router = express.Router();
const { predictFraud } = require('../controllers/fraudController');

// POST /api/predict
router.post('/', predictFraud);

module.exports = router;
