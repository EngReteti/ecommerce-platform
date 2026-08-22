const pool = require('../config/db');

const createProduct = async (sellerId, name, description, price, stock, category, imageUrl) => {
  const result = await pool.query(
    `INSERT INTO products (seller_id, name, description, price, stock, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [sellerId, name, description, price, stock, category, imageUrl]
  );
  return result.rows[0];
};

const getAllProducts = async () => {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0];
};

const updateProduct = async (id, sellerId, fields) => {
  const { name, description, price, stock, category, imageUrl } = fields;
  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6
     WHERE id = $7 AND seller_id = $8 RETURNING *`,
    [name, description, price, stock, category, imageUrl, id, sellerId]
  );
  return result.rows[0];
};

const deleteProduct = async (id, sellerId) => {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING *',
    [id, sellerId]
  );
  return result.rows[0];
};

const getProductsBySeller = async (sellerId) => {
  const result = await pool.query(
    'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
    [sellerId]
  );
  return result.rows;
};

const getLowStockProducts = async (sellerId, threshold = 5) => {
  const result = await pool.query(
    `SELECT id, name, stock, category FROM products
     WHERE seller_id = $1 AND stock < $2
     ORDER BY stock ASC`,
    [sellerId, threshold]
  );
  return result.rows;
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts, getProductsBySeller };
