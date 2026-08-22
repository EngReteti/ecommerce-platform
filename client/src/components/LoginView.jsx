import React, { useState } from 'react';

export default function LoginView({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegistering
      ? 'https://ecommerce-platform-09ag.onrender.com/api/auth/register'
      : 'https://ecommerce-platform-09ag.onrender.com/api/auth/login';

    const payload = isRegistering ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your details.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '5px' }}>My E-Commerce Store</h1>
        <h2 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '20px', fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: '0', fontWeight: '600', color: '#555' }}>
          {isRegistering ? 'Create Account' : 'Sign In'}
        </h2>

        {error && <p style={{ color: 'var(--color-red)', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isRegistering && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid var(--color-ink)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '5px' }}
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: 'var(--color-green)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}
