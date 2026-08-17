import API_BASE_URL from '../config';
import React, { useState } from 'react';
import { useCart } from '../context/useCart';

export default function CartView() {
  const { cart, addToCart, decreaseQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const safeCart = Array.isArray(cart) ? cart : [];
  const totalPrice = safeCart.reduce((total, item) => total + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  const handleCheckout = async () => {
    if (safeCart.length === 0) {
      setMessage('Cart is empty');
      return;
    }

    setMessage('Creating order...');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Missing auth token. Please log out and back in.');

      const addressInput = document.getElementById('delivery-address-input');
      const phoneInput = document.getElementById('mpesa-phone-input');
      
      const addressValue = addressInput ? addressInput.value.trim() : 'Karen, Nairobi, Kenya';
      const phoneValue = phoneInput ? phoneInput.value.trim() : '0758791006';

      if (!phoneValue) {
        throw new Error('Phone number is required');
      }

      const formattedItems = safeCart.map(i => ({
        productId: i.id || i._id,
        quantity: i.quantity,
        price: i.price
      }));

      // Step 1: Create the order first to get a valid order ID
      const orderRes = await fetch('${API_BASE_URL}/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          address: addressValue,
          shippingAddress: addressValue,
          paymentMethod: 'mpesa',
          items: formattedItems
        })
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

      // Extract order ID from response (supporting common naming patterns)
      const orderId = orderJson.order?.id || orderJson.orderId || orderJson._id;

      setMessage('Connecting to M-Pesa...');

      // Step 2: Initiate M-Pesa STK Push with the created order ID and phone
      const mpesaRes = await fetch('${API_BASE_URL}/api/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orderId: orderId,
          phone: phoneValue,
          phoneNumber: phoneValue,
          amount: Math.round(totalPrice)
        })
      });

      const mpesaJson = await mpesaRes.json();
      if (!mpesaRes.ok) {
        throw new Error(mpesaJson.message || mpesaJson.error || 'M-Pesa STK Push failed');
      }

      setMessage('STK Push sent successfully! Check your phone.');
      clearCart();
    } catch (err) {
      console.error("Checkout Error:", err);
      setMessage(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginTop: '20px', color: '#000' }}>
      <h2>Your Shopping Cart</h2>

      {safeCart.length === 0 ? (
        <p style={{ marginTop: '10px', color: '#666' }}>Your cart is empty.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {safeCart.map((item, index) => (
            <div key={item.id || item._id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ margin: '0', color: '#555', fontSize: '14px' }}>{item.name}</h4>
                <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>KES {item.price} x {item.quantity}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => decreaseQuantity(item.id || item._id)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Total: KES {totalPrice.toFixed(2)}</h3>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Address:</label>
          <input id="delivery-address-input" type="text" defaultValue="Karen, Nairobi, Kenya" style={{ width: '100%', padding: '8px', color: '#000', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>M-Pesa Phone Number:</label>
          <input id="mpesa-phone-input" type="text" defaultValue="0758791006" style={{ width: '100%', padding: '8px', color: '#000', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>

        <button 
          onClick={handleCheckout} 
          disabled={loading || safeCart.length === 0} 
          style={{ width: '100%', marginTop: '20px', background: safeCart.length === 0 ? '#cccccc' : '#007bff', color: 'white', padding: '12px', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: safeCart.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Checkout & Pay'}
        </button>

        {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.includes('success') || message.includes('Creating') ? 'green' : 'red' }}>{message}</p>}
      </div>
    </div>
  );
}
