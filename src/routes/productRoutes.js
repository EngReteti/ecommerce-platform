const express = require('express');
const router = express.Router();
const {
  addProduct,
  listProducts,
  getProduct,
  editProduct,
  removeProduct,
  lowStockAlerts,
} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', listProducts);
router.get('/low-stock', protect, sellerOnly, lowStockAlerts);
router.get('/:id', getProduct);

router.post('/upload-image', protect, sellerOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  res.status(200).json({ imageUrl: req.file.path });
});
router.post('/', protect, sellerOnly, addProduct);
router.put('/:id', protect, sellerOnly, editProduct);
router.delete('/:id', protect, sellerOnly, removeProduct);

module.exports = router;
