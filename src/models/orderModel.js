const pool = require('../config/db');

const createOrderFromCart = async (buyerId, address) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT cart_items.product_id, cart_items.quantity, products.price, products.stock, products.name
       FROM cart_items
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.buyer_id = $1`,
      [buyerId]
    );

    const items = cartResult.rows;

    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    for (const item of items) {
      if (item.quantity > item.stock) {
        throw new Error(`Not enough stock for ${item.name}`);
      }
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (buyer_id, status, total_amount) VALUES ($1, 'pending', $2) RETURNING *`,
      [buyerId, total]
    );
    const order = orderResult.rows[0];
       await client.query(
      `INSERT INTO deliveries (order_id, address) VALUES ($1, $2)`,
      [order.id, address]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE buyer_id = $1', [buyerId]);

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getOrdersByBuyer = async (buyerId) => {
  const result = await pool.query(
    'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC',
    [buyerId]
  );
  return result.rows;
};

const getOrderById = async (orderId, buyerId) => {
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
    [orderId, buyerId]
  );
  if (!orderResult.rows[0]) return null;

  const itemsResult = await pool.query(
    `SELECT order_items.*, products.name FROM order_items
     JOIN products ON order_items.product_id = products.id
     WHERE order_id = $1`,
    [orderId]
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
};

const getSellerSalesSummary = async (sellerId) => {
  const result = await pool.query(
    `SELECT COUNT(DISTINCT orders.id) AS total_orders,
            COALESCE(SUM(order_items.quantity * order_items.price), 0) AS total_revenue
     FROM order_items
     JOIN orders ON order_items.order_id = orders.id
     JOIN products ON order_items.product_id = products.id
     WHERE products.seller_id = $1 AND orders.status = 'paid'`,
    [sellerId]
  );
  return result.rows[0];
};

const getSellerTopProducts = async (sellerId, limit = 5) => {
  const result = await pool.query(
    `SELECT products.id, products.name,
            SUM(order_items.quantity) AS units_sold,
            SUM(order_items.quantity * order_items.price) AS revenue
     FROM order_items
     JOIN orders ON order_items.order_id = orders.id
     JOIN products ON order_items.product_id = products.id
     WHERE products.seller_id = $1 AND orders.status = 'paid'
     GROUP BY products.id, products.name
     ORDER BY units_sold DESC
     LIMIT $2`,
    [sellerId, limit]
  );
  return result.rows;
};

const getSellerRecentOrders = async (sellerId, limit = 10) => {
  const result = await pool.query(
    `SELECT DISTINCT orders.id, orders.status, orders.total_amount, orders.created_at
     FROM orders
     JOIN order_items ON order_items.order_id = orders.id
     JOIN products ON order_items.product_id = products.id
     WHERE products.seller_id = $1
     ORDER BY orders.created_at DESC
     LIMIT $2`,
    [sellerId, limit]
  );
  return result.rows;
};

module.exports = { createOrderFromCart, getOrdersByBuyer, getOrderById, getSellerSalesSummary, getSellerTopProducts, getSellerRecentOrders };
