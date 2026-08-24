const express = require('express');
const router = express.Router();
const { listUsers, demoteToBuyer } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/users', protect, adminOnly, listUsers);
router.put('/users/:id/demote', protect, adminOnly, demoteToBuyer);

module.exports = router;
