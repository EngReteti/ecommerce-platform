import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function ProductDetailView({ product, onBack, onAddToCart }) {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchReviews = () => {
    fetch(`${API_BASE_URL}/api/reviews/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      setMessage('Please write a comment');
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setMessage('Review submitted, thank you!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => '★'.repeat(Math.round(value)) + '☆'.repeat(5 - Math.round(value));

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <button onClick={onBack} className="btn" style={{ marginBottom: '15px', padding: '6px 14px', fontSize: '13px' }}>
        ← Back to Shop
      </button>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {product.image_url && (
          <img src={product.image_url} alt={product.name} style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--color-ink)' }} />
        )}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ marginBottom: '8px' }}>{product.name}</h2>
          <p style={{ color: '#555' }}>{product.description}</p>
          <p style={{ fontWeight: 'bold', fontSize: '22px', color: 'var(--color-green)', margin: '10px 0' }}>KES {product.price}</p>

          {summary && summary.review_count > 0 && (
            <p style={{ color: '#d4a017', fontSize: '18px', marginBottom: '10px' }}>
              {renderStars(summary.average_rating)} <span style={{ color: '#555', fontSize: '14px' }}>({summary.review_count} review{summary.review_count !== 1 ? 's' : ''})</span>
            </p>
          )}

          <button onClick={() => onAddToCart(product)} className="btn btn-primary">
            Add to Cart
          </button>
        </div>
      </div>

      <hr style={{ margin: '25px 0', border: 'none', borderTop: '2px solid var(--color-ink)' }} />

      <h3 style={{ marginBottom: '15px' }}>Reviews</h3>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#666' }}>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {reviews.map((r) => (
  <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px', background: '#FDF8EE' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
      <strong style={{ fontSize: '13px' }}>{r.buyer_name || 'Anonymous'}</strong>
      <p style={{ margin: 0, color: '#d4a017' }}>{renderStars(r.rating)}</p>
    </div>
    <p style={{ margin: 0, color: '#333' }}>{r.comment}</p>
  </div>
))}
              
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', border: '2px solid var(--color-ink)', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '10px' }}>Leave a Review</h4>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>Only buyers who have purchased this product can review it.</p>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Rating:</label>
          <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))} style={{ padding: '6px', border: '2px solid var(--color-ink)', borderRadius: '4px' }}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px', minHeight: '70px' }}
        />
        <button onClick={handleSubmitReview} disabled={submitting} className="btn btn-primary" style={{ marginTop: '10px' }}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {message && (
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: message.includes('thank you') ? 'var(--color-green)' : 'var(--color-red)' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
