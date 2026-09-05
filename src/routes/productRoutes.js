const express = require('express');
const router = express.Router();
const {
  addProduct,
  listProducts,
  getProduct,
  editProduct,
  removeProduct,
  lowStockAlerts,
  myProducts,
} = require('../controllers/productController');

const { protect, sellerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', listProducts);
router.get('/low-stock', protect, sellerOnly, lowStockAlerts);
router.get('/my-products', protect, sellerOnly, myProducts);
router.get('/:id', getProduct);

router.post('/upload-images', protect, sellerOnly, (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('UPLOAD ERROR:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }
    const imageUrls = req.files.map((file) => file.path);
    res.status(200).json({ imageUrls });
  });
});

router.post('/', protect, sellerOnly, addProduct);
router.put('/:id', protect, sellerOnly, editProduct);
router.delete('/:id', protect, sellerOnly, removeProduct);

module.exports = router;
