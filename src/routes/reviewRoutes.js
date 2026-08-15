const express = require('express');
const router = express.Router();
const { addReview, listReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:productId', listReviews);
router.post('/', protect, addReview);

module.exports = router;
