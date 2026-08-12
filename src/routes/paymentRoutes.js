const express = require('express');
const router = express.Router();
const { initiateStripePayment, confirmStripePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/stripe/initiate', initiateStripePayment);
router.post('/stripe/confirm', confirmStripePayment);

module.exports = router;
