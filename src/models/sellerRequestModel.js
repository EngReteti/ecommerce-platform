const pool = require('../config/db');

const createSellerRequest = async (name, email, phone, message) => {
  const result = await pool.query(
    `INSERT INTO seller_requests (name, email, phone, message)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, phone, message]
  );
  return result.rows[0];
};

module.exports = { createSellerRequest };
