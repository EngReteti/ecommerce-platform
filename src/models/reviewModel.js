const pool = require('../config/db');

const hasPurchasedProduct = async (buyerId, productId) => {
  const result = await pool.query(
    `SELECT order_items.id FROM order_items
     JOIN orders ON order_items.order_id = orders.id
     WHERE orders.buyer_id = $1 AND order_items.product_id = $2
     LIMIT 1`,
    [buyerId, productId]
  );
  return result.rows.length > 0;
};

const createReview = async (productId, buyerId, rating, comment) => {
  const result = await pool.query(
    `INSERT INTO reviews (product_id, buyer_id, rating, comment)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [productId, buyerId, rating, comment]
  );
  return result.rows[0];
};

const getReviewsByProduct = async (productId) => {
  const result = await pool.query(
    `SELECT reviews.*, users.name AS buyer_name
     FROM reviews
     JOIN users ON reviews.buyer_id = users.id
     WHERE product_id = $1
     ORDER BY created_at DESC`,
    [productId]
  );
  return result.rows;
};

const getProductRatingSummary = async (productId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS review_count, ROUND(AVG(rating), 1) AS average_rating
     FROM reviews WHERE product_id = $1`,
    [productId]
  );
  return result.rows[0];
};

module.exports = { hasPurchasedProduct, createReview, getReviewsByProduct, getProductRatingSummary };
