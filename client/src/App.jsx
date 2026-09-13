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
import { Store, Heart, Package, ShoppingBag, Settings } from 'lucide-react';

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

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
      {filteredProducts.map((product) => {
        const isSaved = wishlistIds.includes(product.id);
        return (
          <div
            key={product.id}
            className="card"
            style={{ padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
            onClick={() => setSelectedProduct(product)}
          >
            <button
  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
  style={{
    position: 'absolute', top: '6px', right: '6px', background: 'rgba(255,255,255,0.85)',
    border: 'none', borderRadius: '50%', width: '26px', height: '26px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  }}
>
  <Heart size={15} color={isSaved ? 'var(--color-red)' : '#888'} fill={isSaved ? 'var(--color-red)' : 'none'} />
</button>
            <div>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px', border: '2px solid var(--color-ink)' }}
                />
              )}
              <h3 style={{
                margin: '0 0 3px 0', fontSize: '0.8rem', lineHeight: '1.2',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>{product.name}</h3>
              <p style={{
                margin: '0 0 4px 0', fontSize: '0.7rem', color: '#666',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>{product.description}</p>
            </div>
            <div>
              <p style={{ fontWeight: 'bold', margin: '4px 0', fontSize: '0.85rem', color: 'var(--color-green)' }}>
                KSh {product.price}
              </p>
              <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="btn btn-primary" style={{ width: '100%', padding: '5px', fontSize: '0.7rem' }}>
                Add to Cart
              </button>
            </div>
          </div>
        );
      })}
    </div>

      <div style={{
  position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
  display: 'flex', justifyContent: 'space-around', alignItems: 'center',
  background: '#fff', borderTop: '3px solid var(--color-ink)',
  boxShadow: '0 -2px 0px var(--color-ink)', padding: '8px 0'
}}>
  <button onClick={() => setActiveView('shop')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeView === 'shop' ? 'var(--color-marigold)' : 'var(--color-ink)', cursor: 'pointer' }}>
    <Store size={20} />
    <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Shop</span>
  </button>
  <button onClick={() => setActiveView('wishlist')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeView === 'wishlist' ? 'var(--color-marigold)' : 'var(--color-ink)', cursor: 'pointer' }}>
    <Heart size={20} />
    <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Wishlist</span>
  </button>
  <button onClick={() => setActiveView('orders')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeView === 'orders' ? 'var(--color-marigold)' : 'var(--color-ink)', cursor: 'pointer' }}>
    <Package size={20} />
    <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Orders</span>
  </button>
  {(userRole === 'seller' || userRole === 'admin') && (
    <button onClick={() => setActiveView('my-products')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: (activeView === 'my-products' || activeView === 'add-product' || activeView === 'analytics') ? 'var(--color-marigold)' : 'var(--color-ink)', cursor: 'pointer' }}>
      <ShoppingBag size={20} />
      <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Seller</span>
    </button>
  )}
  {userRole === 'admin' && (
    <button onClick={() => setActiveView('admin')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeView === 'admin' ? 'var(--color-marigold)' : 'var(--color-ink)', cursor: 'pointer' }}>
      <Settings size={20} />
      <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Admin</span>
    </button>
  )}
</div>
<div style={{ height: '60px' }} />

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
        <p style={{ margin: '0 0 4px 0' }}>Built by Lerionka</p>
        <p style={{ margin: 0 }}>
          Questions or feedback? <a href="mailto:lerionkareteti@gmail.com" style={{ color: 'var(--color-green)', fontWeight: 'bold' }}>lerionkareteti@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}

