import React, { useState, useEffect } from 'react';
import CartView from './components/CartView';
import LoginView from './components/LoginView';
import { useCart } from './context/useCart';
import './App.css';
import MyOrdersView from './components/MyOrdersView';
import AddProductView from './components/AddProductView';
import MyProductsView from './components/MyProductsView';
import ProductDetailView from './components/ProductDetailView';
import AnalyticsView from './components/AnalyticsView';
import AdminView from './components/AdminView';
import WishlistView from './components/WishlistView';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const getRoleFromToken = (t) => {
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    return payload.role;
  } catch (e) {
    return null;
  }
};
const [userRole, setUserRole] = useState(getRoleFromToken(localStorage.getItem('token')));
const [activeView, setActiveView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
const [wishlistIds, setWishlistIds] = useState([]);

const fetchWishlistIds = () => {
  const t = localStorage.getItem('token');
  if (!t) return;
  fetch('https://ecommerce-platform-09ag.onrender.com/api/wishlist', {
    headers: { Authorization: `Bearer ${t}` },
  })
    .then((res) => res.json())
    .then((data) => setWishlistIds(Array.isArray(data) ? data.map((p) => p.id) : []))
    .catch(() => {});
};

const toggleWishlist = async (productId) => {
  const t = localStorage.getItem('token');
  const isSaved = wishlistIds.includes(productId);
  try {
    if (isSaved) {
      await fetch(`https://ecommerce-platform-09ag.onrender.com/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      });
    } else {
      await fetch('https://ecommerce-platform-09ag.onrender.com/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ productId }),
      });
    }
    fetchWishlistIds();
  } catch (err) {
    // silent fail
  }
};

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
useEffect(() => {
  fetchWishlistIds();
}, [token]);

const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

const filteredProducts = products.filter((p) => {
  const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginView onLoginSuccess={() => {
  const newToken = localStorage.getItem('token');
  setToken(newToken);
  setUserRole(getRoleFromToken(newToken));
}} />;
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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
  <input
    type="text"
    placeholder="Search products..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ flex: 2, minWidth: '150px', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }}
  />
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    style={{ flex: 1, minWidth: '120px', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }}
  >
    {categories.map((cat) => (
      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
    ))}
  </select>
</div>

{filteredProducts.length === 0 && !loading && (
  <div style={{ textAlign: 'center', padding: '30px 15px', border: '2px dashed var(--color-ink)', borderRadius: '8px' }}>
    <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>🔍</p>
    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>No matches found</p>
    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Try a different search term or category.</p>
  </div>
)}

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
  {filteredProducts.map((product) => (
          <div key={product.id || product._id} onClick={() => setSelectedProduct(product)} className="card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
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
              <div style={{ display: 'flex', gap: '6px' }}>
  <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="btn btn-primary" style={{ flex: 1 }}>
    Add to Cart
  </button>
  <button
    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
    className="btn"
    style={{ background: wishlistIds.includes(product.id) ? 'var(--color-red)' : '#fff', color: wishlistIds.includes(product.id) ? '#fff' : 'var(--color-ink)', padding: '0 14px', fontSize: '18px' }}
  >
    {wishlistIds.includes(product.id) ? '♥' : '♡'}
  </button>
</div>
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
  onClick={() => setActiveView('wishlist')}
  className="btn"
  style={{ flex: 1, background: activeView === 'wishlist' ? 'var(--color-marigold)' : '#fff' }}
>
  Wishlist
</button>
        <button
          onClick={() => setActiveView('orders')}
          className="btn"
          style={{ flex: 1, background: activeView === 'orders' ? 'var(--color-marigold)' : '#fff' }}
        >
          My Orders
        </button>
      </div>

      {(userRole === 'seller' || userRole === 'admin') && (
  <>
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
    <button
      onClick={() => setActiveView('analytics')}
      className="btn"
      style={{ flex: 1, background: activeView === 'analytics' ? 'var(--color-marigold)' : '#fff' }}
    >
      Dashboard
    </button>
  </>
)}
{userRole === 'admin' && (
  <button
    onClick={() => setActiveView('admin')}
    className="btn"
    style={{ flex: 1, background: activeView === 'admin' ? 'var(--color-marigold)' : '#fff' }}
  >
    Admin
  </button>
)}

      {activeView === 'shop' && selectedProduct && (
  <ProductDetailView
    product={selectedProduct}
    onBack={() => setSelectedProduct(null)}
    onAddToCart={(p) => { addToCart(p); setSelectedProduct(null); }}
  />
)}
{activeView === 'shop' && !selectedProduct && <CartView />}
      {activeView === 'orders' && <MyOrdersView />}
{activeView === 'add-product' && <AddProductView />}
{activeView === 'my-products' && <MyProductsView />}
{activeView === 'analytics' && <AnalyticsView />}
{activeView === 'admin' && userRole === 'admin' && <AdminView />}
{activeView === 'wishlist' && <WishlistView onAddToCart={addToCart} />}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid var(--color-ink)', textAlign: 'center', fontSize: '13px', color: '#888' }}>
        <p style={{ margin: '0 0 4px 0' }}>Built by Lerionka — CS student, Cooperative University of Kenya</p>
        <p style={{ margin: 0 }}>
          Questions or feedback? <a href="mailto:lerionkareteti@gmail.com" style={{ color: 'var(--color-green)', fontWeight: 'bold' }}>lerionkareteti@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}

