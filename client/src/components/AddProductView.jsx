import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function AddProductView() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    if (files.length === 0) return;
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
    setImageUrls([]);
  };

  const handleRemovePhoto = (i) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    setImageUrls([]);
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    setUploading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append('images', file));

      const res = await fetch(`${API_BASE_URL}/api/products/upload-images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');
      setImageUrls(data.imageUrls);
      setMessage(`${data.imageUrls.length} photo(s) uploaded!`);
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          category,
          images: imageUrls,
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
      setImageFiles([]);
      setImagePreviews([]);
      setImageUrls([]);
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
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Photos (up to 5)</label>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Tip: in your gallery, look for "Select multiple" or long-press a photo to select several at once.</p>
        <input type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ marginBottom: '10px' }} />
        {imageFiles.length > 0 && (
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-green)' }}>{imageFiles.length} photo{imageFiles.length !== 1 ? 's' : ''} selected</p>
        )}
        {imagePreviews.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {imagePreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt={`preview ${i}`} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-red)', color: '#fff', border: '2px solid #fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', lineHeight: '1' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {imageUrls.length > 0 && <p style={{ color: 'var(--color-green)', fontWeight: 'bold', marginTop: '5px' }}>Photos ready</p>}
            <button onClick={handleImageUpload} disabled={uploading} className="btn" style={{ display: 'block', marginTop: '10px', background: 'var(--color-green)', color: '#fff' }}>
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Product Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px', minHeight: '80px' }} />
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Price (KES)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid var(--color-ink)', borderRadius: '6px' }} />
      </div>

      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
        {submitting ? 'Adding...' : 'Add Product'}
      </button>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.includes('success') || message.includes('ready') || message.includes('uploaded') ? 'var(--color-green)' : 'var(--color-red)' }}>{message}</p>}
    </div>
  );
}
