const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../models/cartModel');

const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid productId and quantity are required' });
    }

    const item = await addToCart(req.user.id, productId, quantity);
    res.status(201).json({ message: 'Item added to cart', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const viewCart = async (req, res) => {
  try {
    const items = await getCart(req.user.id);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const item = await updateCartItem(req.user.id, req.params.productId, quantity);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    res.json({ message: 'Cart item updated', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const item = await removeFromCart(req.user.id, req.params.productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addItem, viewCart, updateItem, removeItem };
