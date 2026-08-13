const axios = require('axios');
const { getOrderById } = require('../models/orderModel');
const { createPayment, updatePaymentStatus } = require('../models/paymentModel');
const pool = require('../config/db');

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

const initiateMpesaPayment = async (req, res) => {
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

    const accessToken = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(order.total_amount),
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `Order${order.id}`,
        TransactionDesc: `Payment for order ${order.id}`,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const checkoutRequestId = stkResponse.data.CheckoutRequestID;

    const payment = await createPayment(
      order.id,
      'mpesa',
      order.total_amount,
      checkoutRequestId,
      'pending'
    );

    res.status(201).json({
      message: 'M-Pesa payment initiated. Check your phone to complete payment.',
      payment,
    });
  } catch (err) {
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
};

const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body.Body.stkCallback;
    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    const status = resultCode === 0 ? 'paid' : 'failed';

    const payment = await updatePaymentStatus(checkoutRequestId, status);

    if (payment && status === 'paid') {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', payment.order_id]);
    }

    res.status(200).json({ message: 'Callback received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { initiateMpesaPayment, mpesaCallback };
