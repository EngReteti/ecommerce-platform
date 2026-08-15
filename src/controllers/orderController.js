const { createOrderFromCart, getOrdersByBuyer, getOrderById } = require('../models/orderModel');

const checkout = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    const order = await createOrderFromCart(req.user.id, address);
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const myOrders = async (req, res) => {
  try {
    const orders = await getOrdersByBuyer(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const orderDetails = async (req, res) => {
  try {
    const order = await getOrderById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { checkout, myOrders, orderDetails };
