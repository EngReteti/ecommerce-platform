import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function WishlistView({ onAddToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load wishlist');
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist();
    } catch (err) {
      // silent fail, list stays as-is
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading your wishlist...</p>;
  if (error) return <p style={{ padding: '20px', color: 'var(--color-red)' }}>Error: {error}</p>;

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h2>My Wishlist</h2>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 15px', border: '2px dashed var(--color-ink)', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>♡</p>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Your wishlist is empty</p>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Tap the heart on any product to save it here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '12px' }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
              )}
              <strong style={{ fontSize: '14px' }}>{item.name}</strong>
              <p style={{ margin: '4px 0', color: 'var(--color-green)', fontWeight: 'bold' }}>KES {item.price}</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button onClick={() => onAddToCart(item)} className="btn btn-primary" style={{ flex: 1, fontSize: '12px', padding: '6px' }}>
                  Add to Cart
                </button>
                <button onClick={() => handleRemove(item.id)} className="btn" style={{ background: 'var(--color-red)', color: '#fff', fontSize: '12px', padding: '6px' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
