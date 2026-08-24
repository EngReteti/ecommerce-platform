const pool = require('../config/db');

const createSellerRequest = async (name, email, phone, message) => {
  const result = await pool.query(
    `INSERT INTO seller_requests (name, email, phone, message)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, phone, message]
  );
  return result.rows[0];
};

const getPendingSellerRequests = async () => {
  const result = await pool.query(
    `SELECT * FROM seller_requests WHERE status = 'pending' ORDER BY created_at ASC`
  );
  return result.rows;
};

const updateSellerRequestStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE seller_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

const promoteUserToSeller = async (email) => {
  const result = await pool.query(
    `UPDATE users SET role = 'seller' WHERE email = $1 RETURNING id, name, email, role`,
    [email]
  );
  return result.rows[0];
};

module.exports = { createSellerRequest, getPendingSellerRequests, updateSellerRequestStatus, promoteUserToSeller };
