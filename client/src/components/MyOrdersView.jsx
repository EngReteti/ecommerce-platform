import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function MyOrdersView() {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load orders');
        return res.json();
      })
      .then(async (data) => {
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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const statusColor = (status) => {
    if (status === 'delivered') return '#28a745';
    if (status === 'in_transit' || status === 'dispatched') return '#007bff';
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

  if (loading) return <p style={{ padding: '20px' }}>Loading your orders...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginTop: '20px', color: '#000' }}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p style={{ color: '#666' }}>You haven't placed any orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {orders.map((order) => {
            const delivery = deliveries[order.id];
            return (
              <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Order #{order.id}</strong>
                  <span style={{ fontWeight: 'bold', color: order.status === 'paid' ? '#28a745' : '#dc3545' }}>
                    {order.status === 'paid' ? 'Paid' : order.status}
                  </span>
                </div>
                <p style={{ margin: '8px 0 4px 0', color: '#555' }}>Total: KES {order.total_amount}</p>

                {delivery ? (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f0f4f8', borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: statusColor(delivery.status) }}>
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
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#999' }}>Delivery info not yet available</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
