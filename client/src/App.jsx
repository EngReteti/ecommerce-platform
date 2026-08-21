import React, { useState, useEffect } from 'react';
import CartView from './components/CartView';
import LoginView from './components/LoginView';
import { useCart } from './context/useCart';
import './App.css';
import MyOrdersView from './components/MyOrdersView';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('shop');
const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { cart, addToCart } = useCart();

  useEffect(() => {
    if (token) {
      fetch('https://ecommerce-platform-09ag.onrender.com/api/products')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch products');
          return res.json();
        })
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginView onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>My E-Commerce Store</h1>
          <p style={{ margin: 0, color: '#666' }}>Connected to Live Backend API</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      <div style={{ background: '#f0f0f0', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px' }}>
        🛒 Cart Items: {cart.reduce((total, item) => total + item.quantity, 0)}
      </div>

      {loading && <p>Loading products from backend...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id || product._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
              <p style={{ color: '#555', fontSize: '14px' }}>{product.description}</p>
            </div>
            <div>
              <p style={{ fontWeight: 'bold', margin: '10px 0' }}>KES {product.price}</p>
              <button
                onClick={() => addToCart(product)}
                style={{ width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
  <button
    onClick={() => setActiveView('shop')}
    style={{ flex: 1, padding: '10px', fontWeight: 'bold', border: activeView === 'shop' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '4px', background: activeView === 'shop' ? '#e7f1ff' : '#fff', cursor: 'pointer' }}
  >
    Shop
  </button>
  <button
    onClick={() => setActiveView('orders')}
    style={{ flex: 1, padding: '10px', fontWeight: 'bold', border: activeView === 'orders' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '4px', background: activeView === 'orders' ? '#e7f1ff' : '#fff', cursor: 'pointer' }}
  >
    My Orders
  </button>
</div>

{activeView === 'shop' && <CartView />}
{activeView === 'orders' && <MyOrdersView />}
    </div>
  );
}

