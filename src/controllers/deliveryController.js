const { getDeliveryByOrderId, updateDeliveryStatus } = require('../models/deliveryModel');
const { getOrderById } = require('../models/orderModel');

const viewDelivery = async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const delivery = await getDeliveryByOrderId(req.params.orderId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDelivery = async (req, res) => {
  try {
    const { status, courierName, trackingCode } = req.body;

    const validStatuses = ['not_dispatched', 'dispatched', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const delivery = await updateDeliveryStatus(
      req.params.orderId,
      status,
      courierName,
      trackingCode
    );

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }

    res.json({ message: 'Delivery updated', delivery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { viewDelivery, updateDelivery };
