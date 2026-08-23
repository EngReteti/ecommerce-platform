const { createSellerRequest } = require('../models/sellerRequestModel');

const submitSellerRequest = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const request = await createSellerRequest(name, email, phone, message);
    res.status(201).json({ message: 'Request submitted! We will review and get back to you.', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitSellerRequest };
