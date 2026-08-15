const pool = require('../config/db');

const createDelivery = async (orderId, address) => {
  const result = await pool.query(
    `INSERT INTO deliveries (order_id, address) VALUES ($1, $2) RETURNING *`,
    [orderId, address]
  );
  return result.rows[0];
};

const getDeliveryByOrderId = async (orderId) => {
  const result = await pool.query('SELECT * FROM deliveries WHERE order_id = $1', [orderId]);
  return result.rows[0];
};

const updateDeliveryStatus = async (orderId, status, courierName, trackingCode) => {
  const result = await pool.query(
    `UPDATE deliveries
     SET status = $1, courier_name = COALESCE($2, courier_name),
         tracking_code = COALESCE($3, tracking_code), updated_at = NOW()
     WHERE order_id = $4 RETURNING *`,
    [status, courierName, trackingCode, orderId]
  );
  return result.rows[0];
};

module.exports = { createDelivery, getDeliveryByOrderId, updateDeliveryStatus };
