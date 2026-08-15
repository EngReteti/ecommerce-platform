const express = require('express');
const router = express.Router();
const { viewDelivery, updateDelivery } = require('../controllers/deliveryController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:orderId', viewDelivery);
router.put('/:orderId', sellerOnly, updateDelivery);

module.exports = router;
