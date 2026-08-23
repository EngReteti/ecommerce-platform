import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function AddProductView() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl(null);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');
      setImageUrl(data.imageUrl);
      setMessage('Image uploaded!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
  if (!name || !price) {
    setMessage('Name and price are required');
    return;
  }
  if (parseFloat(price) <= 0) {
    setMessage('Price must be greater than 0');
    return;
  }
  if (stock && parseInt(stock) < 0) {
    setMessage('Stock cannot be negative');
    return;
  }
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          category,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      setMessage('Product added successfully!');
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setImageFile(null);
      setImagePreview(null);
      setImageUrl(null);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <h2>Add New Product</h2>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Photo:</label>
        <input type="file" accept="image/*" onChange={handleFileSelect} style={{ marginBottom: '10px' }} />
        {imagePreview && (
          <div style={{ marginTop: '10px' }}>
            <img src={imagePreview} alt="preview" style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
            {!imageUrl && (
              <button onClick={handleImageUpload} disabled={uploading} className="btn" style={{ display: 'block', marginTop: '10px', background: 'var(--color-green)', color: '#fff' }}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            )}
            {imageUrl && <p style={{ color: 'var(--color-green)', fontWeight: 'bold', marginTop: '5px' }}>✓ Photo ready</p>}
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px', minHeight: '80px' }} />
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (KES):</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock:</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Category:</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
      </div>

      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
        {submitting ? 'Adding...' : 'Add Product'}
      </button>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.includes('success') || message.includes('ready') || message.includes('uploaded') ? 'var(--color-green)' : 'var(--color-red)' }}>{message}</p>}
    </div>
  );
}
