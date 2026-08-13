const express = require('express');
const router = express.Router();
const { initiateAirtelPayment, airtelCallback } = require('../controllers/airtelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiateAirtelPayment);
router.post('/callback', airtelCallback);

module.exports = router;
