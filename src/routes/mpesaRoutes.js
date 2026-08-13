const express = require('express');
const router = express.Router();
const { initiateMpesaPayment, mpesaCallback } = require('../controllers/mpesaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiateMpesaPayment);
router.post('/callback', mpesaCallback);

module.exports = router;
