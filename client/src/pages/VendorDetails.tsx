import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorAPI } from '../api';

interface Vendor {
  _id: string;
  businessName: string;
  category: string;
  description: string;
  address: any;
  contactInfo: any;
  priceRange: any;
  services: any[];
  ratings: any;
  userId: any;
}

const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await vendorAPI.getById(id!);
      setVendor(response.data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!vendor) return <div className="empty-state">Vendor not found</div>;

  return (
    <div className="container">
      <div className="page-header">
        <button onClick={() => navigate('/vendors')} className="btn btn-secondary">
          ← Back
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{vendor.businessName}</h1>
            <span className="badge badge-primary">{vendor.category}</span>
          </div>
          {vendor.ratings?.average > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                ⭐ {vendor.ratings.average.toFixed(1)}
              </div>
              <div style={{ color: '#666' }}>{vendor.ratings.count} reviews</div>
            </div>
          )}
        </div>

        {vendor.description && (
          <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.6' }}>
            {vendor.description}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div>
            <h4>Contact Information</h4>
            {vendor.contactInfo?.phone && <p>📞 {vendor.contactInfo.phone}</p>}
            {vendor.contactInfo?.email && <p>✉️ {vendor.contactInfo.email}</p>}
            {vendor.contactInfo?.website && (
              <p>
                <a href={vendor.contactInfo.website} target="_blank" rel="noopener noreferrer">
                  🌐 Website
                </a>
              </p>
            )}
          </div>

          <div>
            <h4>Address</h4>
            {vendor.address && (
              <>
                {vendor.address.street && <p>{vendor.address.street}</p>}
                <p>
                  {vendor.address.city}
                  {vendor.address.state && `, ${vendor.address.state}`}
                  {vendor.address.pincode && ` - ${vendor.address.pincode}`}
                </p>
              </>
            )}
          </div>

          <div>
            <h4>Price Range</h4>
            {vendor.priceRange ? (
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                ₹{vendor.priceRange.min?.toLocaleString()} - ₹{vendor.priceRange.max?.toLocaleString()}
              </p>
            ) : (
              <p>Contact for pricing</p>
            )}
          </div>
        </div>

        {vendor.services && vendor.services.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h4>Services Offered</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {vendor.services.map((service, index) => (
                <div key={index} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                  <strong>{service.name}</strong>
                  {service.description && <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>{service.description}</p>}
                  {service.price && (
                    <p style={{ marginTop: '0.5rem', color: '#667eea' }}>₹{service.price.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;
