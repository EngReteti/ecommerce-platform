const pool = require('../config/db');

const createProduct = async (seller_id, name, description, price, stock, category, image_url) => {
  const result = await pool.query(
    `INSERT INTO products (seller_id, name, description, price, stock, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [seller_id, name, description, price, stock, category, image_url]
  );
  return result.rows[0];
};

const addProductImage = async (productId, imageUrl, position) => {
  const result = await pool.query(
    `INSERT INTO product_images (product_id, image_url, position) VALUES ($1, $2, $3) RETURNING *`,
    [productId, imageUrl, position]
  );
  return result.rows[0];
};

const getProductImages = async (productId) => {
  const result = await pool.query(
    `SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY position ASC`,
    [productId]
  );
  return result.rows.map((r) => r.image_url);
};

const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT p.*, COALESCE(
      json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
    ) AS images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query(`
    SELECT p.*, COALESCE(
      json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
    ) AS images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `, [id]);
  return result.rows[0];
};

const updateProduct = async (id, sellerId, fields) => {
  const { name, description, price, stock, category, image_url } = fields;
  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, stock = $4, category = $5, image_url = $6
     WHERE id = $7 AND seller_id = $8 RETURNING *`,
    [name, description, price, stock, category, image_url, id, sellerId]
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
  const result = await pool.query(`
    SELECT p.*, COALESCE(
      json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
    ) AS images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE p.seller_id = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [sellerId]);
  return result.rows;
};

const getLowStockProducts = async (sellerId, threshold = 5) => {
  const result = await pool.query(
    'SELECT id, name, stock, category FROM products WHERE seller_id = $1 AND stock < $2 ORDER BY stock ASC',
    [sellerId, threshold]
  );
  return result.rows;
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts, getProductsBySeller, addProductImage, getProductImages };
