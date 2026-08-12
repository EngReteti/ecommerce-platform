const pool = require('../config/db');

const createPayment = async (orderId, method, amount, transactionRef, status = 'pending') => {
  const result = await pool.query(
    `INSERT INTO payments (order_id, method, amount, status, transaction_ref)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [orderId, method, amount, status, transactionRef]
  );
  return result.rows[0];
};

const updatePaymentStatus = async (transactionRef, status) => {
  const result = await pool.query(
    `UPDATE payments SET status = $1 WHERE transaction_ref = $2 RETURNING *`,
    [status, transactionRef]
  );
  return result.rows[0];
};

const getPaymentByOrderId = async (orderId) => {
  const result = await pool.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
  return result.rows[0];
};

module.exports = { createPayment, updatePaymentStatus, getPaymentByOrderId };
