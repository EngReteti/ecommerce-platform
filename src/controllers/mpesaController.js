const axios = require('axios');
const { getOrderById } = require('../models/orderModel');
const { createPayment, updatePaymentStatus } = require('../models/paymentModel');
const pool = require('../config/db');

const getAccessToken = async () => {

  const key = (process.env.MPESA_CONSUMER_KEY || '').trim();
  const secret = (process.env.MPESA_CONSUMER_SECRET || '').trim();
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}`, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' } }
  );

  return response.data.access_token;
};

const initiateMpesaPayment = async (req, res) => {
  try {
    const SHORTCODE = (process.env.MPESA_SHORTCODE || '').trim();
    const PASSKEY = (process.env.MPESA_PASSKEY || '').trim();
    const CALLBACK_URL = (process.env.MPESA_CALLBACK_URL || '').trim();
    const { orderId, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    let order = await getOrderById(orderId, req.user ? req.user.id : null);
  if (!order) { order = { id: orderId || 1, total_amount: 49.99, status: 'pending' }; }

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    const accessToken = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${SHORTCODE}${PASSKEY}${timestamp}`
    ).toString('base64');

    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(order.total_amount),
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: CALLBACK_URL,
        AccountReference: `Order${order.id}`,
        TransactionDesc: `Payment for order ${order.id}`,
      },
      { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' } }
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
    console.error('MPESA DEBUG FULL ERROR:', err);
    if (err.response) {
      console.error('RESPONSE HEADERS:', JSON.stringify(err.response.headers));
      console.error('RESPONSE DATA TYPE:', typeof err.response.data);
      console.error('RESPONSE DATA RAW:', err.response.data);
      console.error('RESPONSE STATUS TEXT:', err.response.statusText);
    } else if (err.request) {
      console.error('NO RESPONSE RECEIVED - request was made but no response came back');
    } else {
      console.error('ERROR SETTING UP REQUEST:', err.message);
    }
    res.status(500).json({
      error: err.response ? err.response.data : err.message,
      errorType: err.name,
      errorString: String(err),
      stack: err.stack
    });
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
