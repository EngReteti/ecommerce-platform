import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function AdminView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchRequests = () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    fetch(`${API_BASE_URL}/api/seller-requests/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load requests');
        return res.json();
      })
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action, name) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller-requests/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action}`);
      setActionMessage(data.message || `${name} ${action}d`);
      fetchRequests();
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading requests...</p>;
  if (error) return <p style={{ padding: '20px', color: 'var(--color-red)' }}>Error: {error}</p>;

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h2>Seller Applications</h2>

      {actionMessage && (
        <p style={{ fontWeight: 'bold', color: 'var(--color-green)', marginTop: '10px' }}>{actionMessage}</p>
      )}

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 15px', border: '2px dashed var(--color-ink)', borderRadius: '8px', marginTop: '15px' }}>
          <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>📭</p>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>No pending applications</p>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>New seller requests will show up here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {requests.map((r) => (
            <div key={r.id} style={{ border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '15px', background: '#fff', boxShadow: '3px 3px 0px var(--color-ink)' }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>{r.name}</strong>
              <p style={{ margin: '4px 0', color: '#555', fontSize: '14px' }}>{r.email}</p>
              {r.phone && <p style={{ margin: '4px 0', color: '#555', fontSize: '14px' }}>{r.phone}</p>}
              {r.message && <p style={{ margin: '8px 0', fontStyle: 'italic', color: '#333' }}>"{r.message}"</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleAction(r.id, 'approve', r.name)} className="btn" style={{ background: 'var(--color-green)', color: '#fff', flex: 1 }}>
                  Approve
                </button>
                <button onClick={() => handleAction(r.id, 'reject', r.name)} className="btn" style={{ background: 'var(--color-red)', color: '#fff', flex: 1 }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
