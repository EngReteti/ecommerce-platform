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

router.post('/upload-image', protect, sellerOnly, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('UPLOAD ERROR:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    res.status(200).json({ imageUrl: req.file.path });
  });
});

router.post('/', protect, sellerOnly, addProduct);
router.put('/:id', protect, sellerOnly, editProduct);
router.delete('/:id', protect, sellerOnly, removeProduct);

module.exports = router;
