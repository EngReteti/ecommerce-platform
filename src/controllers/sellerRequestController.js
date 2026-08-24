const { createSellerRequest, getPendingSellerRequests, updateSellerRequestStatus, promoteUserToSeller } = require('../models/sellerRequestModel');

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

const listPendingRequests = async (req, res) => {
  try {
    const requests = await getPendingSellerRequests();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approveSellerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await updateSellerRequestStatus(id, 'approved');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const user = await promoteUserToSeller(request.email);
    if (!user) {
      return res.status(400).json({ error: `${request.email} must register an account before being approved as a seller` });
    }
    res.json({ message: `${request.name} approved as a seller`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectSellerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await updateSellerRequestStatus(id, 'rejected');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: `${request.name}'s request rejected`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitSellerRequest, listPendingRequests, approveSellerRequest, rejectSellerRequest };
