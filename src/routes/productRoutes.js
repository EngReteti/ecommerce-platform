const express = require('express');
const router = express.Router();
const {
  addProduct,
  listProducts,
  getProduct,
  editProduct,
  removeProduct,
} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', protect, sellerOnly, addProduct);
router.put('/:id', protect, sellerOnly, editProduct);
router.delete('/:id', protect, sellerOnly, removeProduct);

module.exports = router;
