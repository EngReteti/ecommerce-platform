const express = require('express');
const router = express.Router();
const { addItem, viewCart, updateItem, removeItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', viewCart);
router.post('/', addItem);
router.put('/:productId', updateItem);
router.delete('/:productId', removeItem);

module.exports = router;
