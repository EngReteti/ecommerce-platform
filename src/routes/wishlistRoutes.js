const express = require('express');
const router = express.Router();
const { addItem, removeItem, listWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, listWishlist);
router.post('/', protect, addItem);
router.delete('/:productId', protect, removeItem);

module.exports = router;
