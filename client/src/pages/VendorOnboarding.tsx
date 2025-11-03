import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../api';

const VendorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    contactInfo: {
      phone: '',
      alternatePhone: '',
      email: '',
      website: '',
    },
    priceRange: {
      min: '',
      max: '',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await vendorAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [field]: value,
        },
      });
    } else if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          [field]: value,
        },
      });
    } else if (name.startsWith('priceRange.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        priceRange: {
          ...formData.priceRange,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        priceRange: {
          min: Number(formData.priceRange.min),
          max: Number(formData.priceRange.max),
        },
      };
      await vendorAPI.create(submitData);
      alert('Vendor profile created successfully!');
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to create vendor profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Become a Vendor</h1>
      </div>

      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Your Vendor Profile</h2>
        {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Address</h3>
          <div className="form-group">
            <label>Street</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              name="address.pincode"
              value={formData.address.pincode}
              onChange={handleChange}
            />
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Contact Information</h3>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Alternate Phone</label>
            <input
              type="tel"
              name="contactInfo.alternatePhone"
              value={formData.contactInfo.alternatePhone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="contactInfo.website"
              value={formData.contactInfo.website}
              onChange={handleChange}
            />
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Pricing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Min Price (₹)</label>
              <input
                type="number"
                name="priceRange.min"
                value={formData.priceRange.min}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Max Price (₹)</label>
              <input
                type="number"
                name="priceRange.max"
                value={formData.priceRange.max}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Profile...' : 'Create Vendor Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorOnboarding;
