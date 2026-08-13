const axios = require('axios');
const { getOrderById } = require('../models/orderModel');
const { createPayment, updatePaymentStatus } = require('../models/paymentModel');
const pool = require('../config/db');

const getAirtelAccessToken = async () => {
  const response = await axios.post(
    'https://openapiuat.airtel.africa/auth/oauth2/token',
    {
      client_id: process.env.AIRTEL_CLIENT_ID,
      client_secret: process.env.AIRTEL_CLIENT_SECRET,
      grant_type: 'client_credentials',
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data.access_token;
};

const initiateAirtelPayment = async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const order = await getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    const accessToken = await getAirtelAccessToken();
    const transactionRef = `Order${order.id}_${Date.now()}`;

    const collectionResponse = await axios.post(
      'https://openapiuat.airtel.africa/merchant/v1/payments/',
      {
        reference: `Order ${order.id}`,
        subscriber: {
          country: 'KE',
          currency: 'KES',
          msisdn: phoneNumber,
        },
        transaction: {
          amount: Math.round(order.total_amount),
          country: 'KE',
          currency: 'KES',
          id: transactionRef,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': 'KE',
          'X-Currency': 'KES',
        },
      }
    );

    const payment = await createPayment(
      order.id,
      'airtel',
      order.total_amount,
      transactionRef,
      'pending'
    );

    res.status(201).json({
      message: 'Airtel Money payment initiated. Check your phone to complete payment.',
      payment,
      airtelResponse: collectionResponse.data,
    });
  } catch (err) {
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
};

const airtelCallback = async (req, res) => {
  try {
    const { transaction } = req.body;
    const transactionRef = transaction.id;
    const status = transaction.status_code === 'TS' ? 'paid' : 'failed';

    const payment = await updatePaymentStatus(transactionRef, status);

    if (payment && status === 'paid') {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', payment.order_id]);
    }

    res.status(200).json({ message: 'Callback received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { initiateAirtelPayment, airtelCallback };
