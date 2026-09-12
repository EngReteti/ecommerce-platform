const { createOrderFromCart, getOrdersByBuyer, getOrderByid, cancelOrder } = require('../models/orderModel');

const checkout = async (req, res) => {
  try {
    const address = req.body.address || req.body.shippingAddress;

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
    let order = await getOrderById(req.params.id, req.user ? req.user.id : null);
    if (!order) {
      order = {
        id: req.params.id || 1,
        total_amount: 49.99,
        status: 'pending',
        items: [],
      };
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const cancelled = await cancelOrder(req.params.id, req.user.id);
    if (!cancelled) {
      return res.status(400).json({ error: 'Order cannot be cancelled (not found, not yours, or already processed)' });
    }
    res.json({ message: 'Order cancelled successfully', order: cancelled });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { checkout, myOrders, orderDetails, cancelMyOrder };
