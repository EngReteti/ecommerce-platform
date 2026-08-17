import React, { useState } from 'react';
import { useCart } from '../context/useCart';

export default function CartView() {
  const { cart, addToCart, removeFromCart, decreaseQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [address, setAddress] = useState('Nairobi, Kenya');

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://ecommerce-platform-09ag.onrender.com/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          cart,
          address
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order. Please try again.');
      }

      setMessage('Order placed successfully!');
      clearCart();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '8px', marginTop: '20px' }}>
        <h2>Your Cart is Empty</h2>
        <p>Add some products from the store to get started</p>
        {message && <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginTop: '20px' }}>
      <h2>Your Shopping Cart</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
        {cart.map((item) => (
          <div key={item.id || item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>KES {item.price} × {item.quantity}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => decreaseQuantity(item.id || item._id)}
                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => addToCart(item)}
                style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Total: KES {totalPrice.toFixed(2)}</h3>
        
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Delivery Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter delivery address"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{ width: '100%', marginTop: '15px', background: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Processing...' : 'Checkout'}
        </button>

        {message && (
          <p style={{ color: message.includes('success') ? 'green' : 'red', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

