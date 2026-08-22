import React, { useState, useEffect } from 'react';
import CartView from './components/CartView';
import LoginView from './components/LoginView';
import { useCart } from './context/useCart';
import './App.css';
import MyOrdersView from './components/MyOrdersView';
import AddProductView from './components/AddProductView';
import MyProductsView from './components/MyProductsView';

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px' }}>My E-Commerce Store</h1>
          <p style={{ margin: 0, color: '#666' }}>Connected to Live Backend API</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: 'var(--color-red)', color: '#fff' }}>
          Logout
        </button>
      </div>

      <div className="card" style={{ padding: '10px 15px', fontWeight: 'bold', marginBottom: '20px' }}>
        🛒 Cart Items: {cart.reduce((total, item) => total + item.quantity, 0)}
      </div>

      {loading && <p>Loading products from backend...</p>}
      {error && <p style={{ color: 'var(--color-red)' }}>Error: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id || product._id} className="card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h3>
{product.image_url && (
  <img
    src={product.image_url}
    alt={product.name}
    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px', border: '2px solid var(--color-ink)' }}
  />
)}
              <p style={{ color: '#555', fontSize: '14px', fontFamily: 'var(--font-body)' }}>{product.description}</p>
            </div>
            <div>
              <p style={{ fontWeight: 'bold', margin: '10px 0', fontSize: '20px', color: 'var(--color-green)' }}>
                KES {product.price}
              </p>
              <button onClick={() => addToCart(product)} className="btn btn-primary" style={{ width: '100%' }}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button
          onClick={() => setActiveView('shop')}
          className="btn"
          style={{ flex: 1, background: activeView === 'shop' ? 'var(--color-marigold)' : '#fff' }}
        >
          Shop
        </button>
        <button
          onClick={() => setActiveView('orders')}
          className="btn"
          style={{ flex: 1, background: activeView === 'orders' ? 'var(--color-marigold)' : '#fff' }}
        >
          My Orders
        </button>
      </div>
<button
  onClick={() => setActiveView('add-product')}
  className="btn"
  style={{ flex: 1, background: activeView === 'add-product' ? 'var(--color-marigold)' : '#fff' }}
>
  Sell
</button>

<button
  onClick={() => setActiveView('my-products')}
  className="btn"
  style={{ flex: 1, background: activeView === 'my-products' ? 'var(--color-marigold)' : '#fff' }}
>
  My Products
</button>

      {activeView === 'shop' && <CartView />}
      {activeView === 'orders' && <MyOrdersView />}
{activeView === 'add-product' && <AddProductView />}
{activeView === 'my-products' && <MyProductsView />}
    </div>
  );
}
