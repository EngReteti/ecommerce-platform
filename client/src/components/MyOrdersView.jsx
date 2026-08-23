import React, { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';

export default function MyOrdersView() {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      const orderList = Array.isArray(data) ? data : [];
      setOrders(orderList);

      const deliveryResults = {};
      await Promise.all(
        orderList.map(async (order) => {
          try {
            const dRes = await fetch(`${API_BASE_URL}/api/deliveries/${order.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (dRes.ok) {
              deliveryResults[order.id] = await dRes.json();
            }
          } catch (e) {
            // no delivery record yet, skip silently
          }
        })
      );
      setDeliveries(deliveryResults);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const statusColor = (status) => {
    if (status === 'delivered') return 'var(--color-green)';
    if (status === 'in_transit' || status === 'dispatched') return '#0066cc';
    return '#888';
  };

  const statusLabel = (status) => {
    const labels = {
      not_dispatched: 'Not Dispatched',
      dispatched: 'Dispatched',
      in_transit: 'In Transit',
      delivered: 'Delivered',
    };
    return labels[status] || 'Pending';
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading your orders...</p>;
  if (error) return <p style={{ padding: '20px', color: 'var(--color-red)' }}>Error: {error}</p>;

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h2>My Orders</h2>
        {lastUpdated && (
          <span style={{ fontSize: '12px', color: '#999' }}>Updated {formatTime(lastUpdated)}</span>
        )}
      </div>
      {orders.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '30px 15px', border: '2px dashed var(--color-ink)', borderRadius: '8px', marginTop: '15px' }}>
    <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>📦</p>
    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>No orders yet</p>
    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Once you buy something, it'll show up here!</p>
  </div>
) : (
        orders.map((order) => {
          const delivery = deliveries[order.id];
          return (
            <div key={order.id} style={{ border: '1px solid var(--color-ink)', borderRadius: '8px', padding: '15px', background: '#fff', boxShadow: '3px 3px 0px var(--color-ink)', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontFamily: 'var(--font-display)' }}>Order #{order.id}</strong>
                <span style={{ fontWeight: 'bold', color: order.status === 'paid' ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: '8px 0px 4px' }}>Total: KSh {order.total_amount}</p>

              {delivery ? (
                <div style={{ marginTop: '10px', padding: '10px', background: '#F0F8FF', borderRadius: '6px', border: '1px solid #ddd' }}>
                  <p style={{ margin: '0 4px 0', fontWeight: 'bold', color: statusColor(delivery.status) }}>
                    Delivery: {statusLabel(delivery.status)}
                  </p>
                  {delivery.courier_name && (
                    <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>Courier: {delivery.courier_name}</p>
                  )}
                  {delivery.tracking_code && (
                    <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>Tracking: {delivery.tracking_code}</p>
                  )}
                </div>
              ) : (
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#999' }}>Delivery info not yet available</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
