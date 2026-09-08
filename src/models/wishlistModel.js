const pool = require('../config/db');

const addToWishlist = async (buyerId, productId) => {
  const result = await pool.query(
    `INSERT INTO wishlist (buyer_id, product_id) VALUES ($1, $2)
     ON CONFLICT (buyer_id, product_id) DO NOTHING RETURNING *`,
    [buyerId, productId]
  );
  return result.rows[0];
};

const removeFromWishlist = async (buyerId, productId) => {
  const result = await pool.query(
    `DELETE FROM wishlist WHERE buyer_id = $1 AND product_id = $2 RETURNING *`,
    [buyerId, productId]
  );
  return result.rows[0];
};

const getWishlistByBuyer = async (buyerId) => {
  const result = await pool.query(`
    SELECT p.*, COALESCE(
      json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
    ) AS images
    FROM wishlist w
    JOIN products p ON p.id = w.product_id
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE w.buyer_id = $1
    GROUP BY p.id, w.created_at
    ORDER BY w.created_at DESC
  `, [buyerId]);
  return result.rows;
};

module.exports = { addToWishlist, removeFromWishlist, getWishlistByBuyer };
