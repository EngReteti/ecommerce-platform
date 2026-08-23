import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load analytics');
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Loading your dashboard...</p>;
  if (error) return <p style={{ padding: '20px', color: 'var(--color-red)' }}>Error: {error}</p>;
  if (!data) return null;

  const { summary, topProducts, recentOrders, lowStockCount } = data;

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h2>Seller Dashboard</h2>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
        <div style={{ flex: 1, minWidth: '140px', border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '15px', background: '#FDF8EE', boxShadow: '3px 3px 0px var(--color-ink)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 'bold' }}>TOTAL ORDERS</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontFamily: 'var(--font-display)' }}>{summary.total_orders}</p>
        </div>
        <div style={{ flex: 1, minWidth: '140px', border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '15px', background: '#FDF8EE', boxShadow: '3px 3px 0px var(--color-ink)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 'bold' }}>TOTAL REVENUE</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontFamily: 'var(--font-display)', color: 'var(--color-green)' }}>KES {summary.total_revenue}</p>
        </div>
        <div style={{ flex: 1, minWidth: '140px', border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '15px', background: lowStockCount > 0 ? '#fff3f0' : '#FDF8EE', boxShadow: '3px 3px 0px var(--color-ink)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 'bold' }}>LOW STOCK ITEMS</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontFamily: 'var(--font-display)', color: lowStockCount > 0 ? 'var(--color-red)' : 'var(--color-ink)' }}>{lowStockCount}</p>
        </div>
      </div>

      <h3 style={{ marginTop: '25px', marginBottom: '10px' }}>Top Products</h3>
      {topProducts.length === 0 ? (
        <p style={{ color: '#666' }}>No sales data yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topProducts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}>
              <span style={{ fontWeight: 'bold' }}>{p.name || p.product_name}</span>
              <span style={{ color: '#555' }}>{p.total_sold || p.units_sold || ''} sold</span>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '25px', marginBottom: '10px' }}>Recent Orders</h3>
      {recentOrders.length === 0 ? (
        <p style={{ color: '#666' }}>No orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentOrders.map((o) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}>
              <span>Order #{o.id}</span>
              <span style={{ fontWeight: 'bold', color: o.status === 'paid' ? 'var(--color-green)' : '#888' }}>{o.status}</span>
              <span>KES {o.total_amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
