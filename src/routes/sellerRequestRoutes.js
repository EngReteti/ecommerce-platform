const express = require('express');
const router = express.Router();
const { submitSellerRequest } = require('../controllers/sellerRequestController');

router.post('/', submitSellerRequest);

module.exports = router;
