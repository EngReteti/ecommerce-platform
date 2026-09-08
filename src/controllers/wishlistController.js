const { addToWishlist, removeFromWishlist, getWishlistByBuyer } = require('../models/wishlistModel');

const addItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }
    const item = await addToWishlist(req.user.id, productId);
    res.status(201).json({ message: 'Added to wishlist', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const item = await removeFromWishlist(req.user.id, req.params.productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listWishlist = async (req, res) => {
  try {
    const items = await getWishlistByBuyer(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addItem, removeItem, listWishlist };
