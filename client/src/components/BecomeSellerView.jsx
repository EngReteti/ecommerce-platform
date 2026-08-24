import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function BecomeSellerView({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setStatus('Name and email are required');
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setStatus('success');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: '0 0 10px 0' }}>✅</p>
          <h2 style={{ marginBottom: '10px' }}>Request Sent!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>We'll review your application and get back to you.</p>
          <button onClick={onBack} className="btn btn-primary">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '22px', marginBottom: '5px' }}>Become a Seller</h1>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Tell us about yourself and what you'd like to sell. We review every application.
        </p>

        {status && status !== 'success' && (
          <p style={{ color: 'var(--color-red)', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone (optional):</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>What do you want to sell?</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)', minHeight: '70px' }} />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
            ← Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
