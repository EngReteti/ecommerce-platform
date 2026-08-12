const express = require('express');
const router = express.Router();
const { checkout, myOrders, orderDetails } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/checkout', checkout);
router.get('/', myOrders);
router.get('/:id', orderDetails);

module.exports = router;
