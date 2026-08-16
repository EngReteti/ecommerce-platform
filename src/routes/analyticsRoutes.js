const express = require('express');
const router = express.Router();
const { dashboard } = require('../controllers/analyticsController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, sellerOnly, dashboard);

module.exports = router;
