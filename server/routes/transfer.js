const express = require('express');
const router = express.Router();
const { transferMoney } = require('../controllers/transferController');

// POST /api/transfer
router.post('/', transferMoney);

module.exports = router;
