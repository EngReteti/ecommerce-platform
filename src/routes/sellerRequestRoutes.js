const express = require('express');
const router = express.Router();
const { submitSellerRequest, listPendingRequests, approveSellerRequest, rejectSellerRequest } = require('../controllers/sellerRequestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', submitSellerRequest);
router.get('/pending', protect, adminOnly, listPendingRequests);
router.put('/:id/approve', protect, adminOnly, approveSellerRequest);
router.put('/:id/reject', protect, adminOnly, rejectSellerRequest);

module.exports = router;
