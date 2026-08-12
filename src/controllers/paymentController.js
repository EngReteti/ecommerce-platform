const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getOrderById } = require('../models/orderModel');
const { createPayment, updatePaymentStatus, getPaymentByOrderId } = require('../models/paymentModel');
const pool = require('../config/db');

const initiateStripePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    const amountInCents = Math.round(order.total_amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { orderId: order.id.toString(), buyerId: req.user.id.toString() },
    });

    const payment = await createPayment(
      order.id,
      'stripe',
      order.total_amount,
      paymentIntent.id,
      'pending'
    );

    res.status(201).json({
      message: 'Payment initiated',
      clientSecret: paymentIntent.client_secret,
      payment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: `Payment not completed. Status: ${intent.status}` });
    }

    const payment = await updatePaymentStatus(paymentIntentId, 'paid');

    if (payment) {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', payment.order_id]);
    }

    res.json({ message: 'Payment confirmed', payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { initiateStripePayment, confirmStripePayment };
