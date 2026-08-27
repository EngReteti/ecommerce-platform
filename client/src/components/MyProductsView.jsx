import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function MyProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [editingStock, setEditingStock] = useState({});

  const LOW_STOCK_THRESHOLD = 5;

  const fetchProducts = () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/my-products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load your products');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message && err.message.includes('Only sellers')) {
          setError('This page is for sellers only. If you\'d like to sell on our platform, apply from the login screen!');
        } else {
          setError(err.message);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      setMessage(`"${productName}" deleted.`);
      fetchProducts();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleStockUpdate = async (product) => {
    const newStock = editingStock[product.id];
    if (newStock === undefined || newStock === '') return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: parseInt(newStock),
          category: product.category,
          imageUrl: product.image_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');
      setMessage(`Stock updated for "${product.name}".`);
      setEditingStock((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
      fetchProducts();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading your products...</p>;
  if (error) {
    const isPermissionIssue = error.includes('sellers only');
    return (
      <div style={{ textAlign: 'center', padding: '30px 15px', border: '2px dashed var(--color-ink)', borderRadius: '8px', margin: '15px' }}>
        <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{isPermissionIssue ? '🔒' : '⚠️'}</p>
        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{isPermissionIssue ? 'Sellers Only' : 'Something went wrong'}</p>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h2>My Products</h2>

      {message && <p style={{ fontWeight: 'bold', color: message.includes('deleted') || message.includes('updated') ? 'var(--color-green)' : 'var(--color-red)' }}>{message}</p>}

      {products.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '30px 15px', border: '2px dashed var(--color-ink)', borderRadius: '8px', marginTop: '15px' }}>
    <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>🛍️</p>
    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Nothing here yet</p>
    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Head to the "Sell" tab to list your first product!</p>
  </div>
) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {products.map((product) => {
            const isLowStock = product.stock < LOW_STOCK_THRESHOLD;
            return (
              <div key={product.id} style={{ display: 'flex', gap: '12px', border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '12px', background: '#fff', boxShadow: '3px 3px 0px var(--color-ink)' }}>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '15px' }}>{product.name.toUpperCase()}</strong>
                  <p style={{ margin: '4px 0', color: '#555', fontSize: '13px' }}>KES {product.price}</p>

                  {isLowStock && (
                    <p style={{ margin: '4px 0', color: 'var(--color-red)', fontWeight: 'bold', fontSize: '13px' }}>
                      ⚠ Low stock: only {product.stock} left!
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Stock:</label>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onChange={(e) => setEditingStock((prev) => ({ ...prev, [product.id]: e.target.value }))}
                      style={{ width: '60px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button
                      onClick={() => handleStockUpdate(product)}
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--color-green)', color: '#fff' }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--color-red)', color: '#fff' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
