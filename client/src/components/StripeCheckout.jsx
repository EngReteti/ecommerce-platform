import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API_BASE_URL from '../config';

export default function StripeCheckout({ clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);

    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      onError(error.message || 'Card payment failed');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const token = localStorage.getItem('token');
        const confirmRes = await fetch(`${API_BASE_URL}/api/payments/stripe/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        const confirmJson = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmJson.error || 'Payment confirmation failed');
        onSuccess();
      } catch (err) {
        onError(err.message);
      }
    }
    setProcessing(false);
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}>
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        onClick={handlePay}
        disabled={processing || !stripe}
        style={{ width: '100%', marginTop: '15px', background: '#635bff', color: 'white', padding: '12px', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: processing ? 'not-allowed' : 'pointer' }}
      >
        {processing ? 'Processing...' : 'Pay with Card'}
      </button>
    </div>
  );
}
