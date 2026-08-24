const { getAllUsers, setUserRole } = require('../models/userModel');

const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const demoteToBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await setUserRole(id, 'buyer');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: `${user.name} demoted to buyer`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listUsers, demoteToBuyer };
