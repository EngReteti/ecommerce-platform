import API_BASE_URL from '../config';
import React, { useState } from 'react';
import { useCart } from '../context/useCart';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from './StripeCheckout';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CartView() {
  const { cart, addToCart, decreaseQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [clientSecret, setClientSecret] = useState(null);

  const safeCart = Array.isArray(cart) ? cart : [];
  const totalPrice = safeCart.reduce((total, item) => total + (Number(item.price) || 0) * Number(item.quantity || 1), 0);

  const createOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Missing auth token. Please log out and back in.');

    const addressInput = document.getElementById('delivery-address-input');
    const addressValue = addressInput ? addressInput.value.trim() : 'Karen, Nairobi, Kenya';

    const formattedItems = safeCart.map(i => ({
      productId: i.id || i._id,
      quantity: i.quantity,
      price: i.price,
    }));

    const orderRes = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address: addressValue,
        shippingAddress: addressValue,
        paymentMethod,
        items: formattedItems,
      }),
    });

    const responseText = await orderRes.text();
    let orderJson;
    try {
      orderJson = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Server returned non-JSON response (${orderRes.status}): ${responseText || 'Empty body'}`);
    }
    if (!orderRes.ok) {
      throw new Error(orderJson.message || orderJson.error || 'Order creation failed');
    }

    const orderId = orderJson.order?.id || orderJson.orderId || orderJson._id;
    return { orderId, token };
  };

  const handleMpesaCheckout = async () => {
    if (safeCart.length === 0) {
      setMessage('Cart is empty');
      return;
    }
    setMessage('Creating order...');
    setLoading(true);

    try {
      const phoneInput = document.getElementById('mpesa-phone-input');
      const phoneValue = phoneInput ? phoneInput.value.trim() : '0758791006';
      if (!phoneValue) throw new Error('Phone number is required');

      const { orderId, token } = await createOrder();

      setMessage('Connecting to M-Pesa...');

      const mpesaRes = await fetch(`${API_BASE_URL}/api/mpesa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          phone: phoneValue,
          phoneNumber: phoneValue,
          amount: Math.round(totalPrice),
        }),
      });

      const mpesaJson = await mpesaRes.json();
      if (!mpesaRes.ok) {
        throw new Error(mpesaJson.message || mpesaJson.error || 'M-Pesa STK Push failed');
      }

      setMessage('STK Push sent successfully! Check your phone.');
      clearCart();
    } catch (err) {
      console.error('Checkout Error:', err);
      setMessage(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCardCheckout = async () => {
    if (safeCart.length === 0) {
      setMessage('Cart is empty');
      return;
    }
    setMessage('Creating order...');
    setLoading(true);

    try {
      const { orderId, token } = await createOrder();

      setMessage('Preparing card payment...');

      const stripeRes = await fetch(`${API_BASE_URL}/api/payments/stripe/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const stripeJson = await stripeRes.json();
      if (!stripeRes.ok) {
        throw new Error(stripeJson.message || stripeJson.error || 'Stripe payment setup failed');
      }

      setClientSecret(stripeJson.clientSecret);
      setMessage(null);
    } catch (err) {
      console.error('Checkout Error:', err);
      setMessage(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === 'mpesa') {
      handleMpesaCheckout();
    } else {
      handleCardCheckout();
    }
  };

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h2>Your Shopping Cart</h2>

      {safeCart.length === 0 ? (
        <p style={{ marginTop: '10px', color: '#666' }}>Your cart is empty.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {safeCart.map((item, index) => (
            <div key={item.id || item._id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-ink)', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ margin: '0', fontSize: '15px', fontFamily: 'var(--font-body)' }}>{item.name}</h4>
                <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>KES {item.price} x {item.quantity}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => decreaseQuantity(item.id || item._id)}
                  className="btn"
                  style={{ background: 'var(--color-red)', color: '#fff', padding: '5px 12px', boxShadow: '2px 2px 0px var(--color-ink)' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="btn"
                  style={{ background: 'var(--color-green)', color: '#fff', padding: '5px 12px', boxShadow: '2px 2px 0px var(--color-ink)' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: 'var(--color-green)' }}>Total: KES {totalPrice.toFixed(2)}</h3>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Address:</label>
          <input id="delivery-address-input" type="text" defaultValue="Karen, Nairobi, Kenya" style={{ width: '100%', padding: '10px', color: '#000', background: '#fff', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Payment Method:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setPaymentMethod('mpesa'); setClientSecret(null); }}
              className="btn"
              style={{ flex: 1, background: paymentMethod === 'mpesa' ? 'var(--color-marigold)' : '#fff' }}
            >
              M-Pesa
            </button>
            <button
              onClick={() => { setPaymentMethod('card'); setClientSecret(null); }}
              className="btn"
              style={{ flex: 1, background: paymentMethod === 'card' ? 'var(--color-marigold)' : '#fff' }}
            >
              Card (Stripe)
            </button>
          </div>
        </div>

        {paymentMethod === 'mpesa' && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>M-Pesa Phone Number:</label>
            <input id="mpesa-phone-input" type="text" defaultValue="0758791006" style={{ width: '100%', padding: '10px', color: '#000', background: '#fff', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
          </div>
        )}

        {!clientSecret && (
          <button
            onClick={handleCheckout}
            disabled={loading || safeCart.length === 0}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px', opacity: safeCart.length === 0 ? 0.5 : 1, cursor: safeCart.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing...' : 'Checkout & Pay'}
          </button>
        )}

        {clientSecret && paymentMethod === 'card' && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeCheckout
              clientSecret={clientSecret}
              onSuccess={() => {
                setMessage('Payment successful!');
                setClientSecret(null);
                clearCart();
              }}
              onError={(msg) => setMessage(msg)}
            />
          </Elements>
        )}

        {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.includes('success') || message.includes('Creating') ? 'var(--color-green)' : 'var(--color-red)' }}>{message}</p>}
      </div>
    </div>
  );
}
