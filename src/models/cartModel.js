const pool = require('../config/db');

const addToCart = async (buyerId, productId, quantity) => {
  const result = await pool.query(
    `INSERT INTO cart_items (buyer_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (buyer_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + $3
     RETURNING *`,
    [buyerId, productId, quantity]
  );
  return result.rows[0];
};

const getCart = async (buyerId) => {
  const result = await pool.query(
    `SELECT cart_items.id, cart_items.quantity, products.id AS product_id,
            products.name, products.price, products.stock, products.image_url
     FROM cart_items
     JOIN products ON cart_items.product_id = products.id
     WHERE cart_items.buyer_id = $1`,
    [buyerId]
  );
  return result.rows;
};

const updateCartItem = async (buyerId, productId, quantity) => {
  const result = await pool.query(
    `UPDATE cart_items SET quantity = $1
     WHERE buyer_id = $2 AND product_id = $3 RETURNING *`,
    [quantity, buyerId, productId]
  );
  return result.rows[0];
};

const removeFromCart = async (buyerId, productId) => {
  const result = await pool.query(
    'DELETE FROM cart_items WHERE buyer_id = $1 AND product_id = $2 RETURNING *',
    [buyerId, productId]
  );
  return result.rows[0];
};

const clearCart = async (buyerId) => {
  await pool.query('DELETE FROM cart_items WHERE buyer_id = $1', [buyerId]);
};

module.exports = { addToCart, getCart, updateCartItem, removeFromCart, clearCart };
