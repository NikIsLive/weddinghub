import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../api';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    eventName: '',
    description: '',
    startDate: '',
    endDate: '',
    guestCount: '',
    venue: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      type: 'Indoor',
    },
    budget: {
      amount: '',
      currency: 'INR',
    },
    weddingDetails: {
      brideName: '',
      groomName: '',
      ceremonies: [],
    },
    socialGatheringDetails: {
      occasionType: 'Birthday',
      hostName: '',
      theme: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('venue.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        setFormData({
          ...formData,
          venue: {
            ...formData.venue,
            [parts[1]]: value,
          },
        });
      } else if (parts[1] === 'address') {
        const field = parts[2];
        setFormData({
          ...formData,
          venue: {
            ...formData.venue,
            address: {
              ...formData.venue.address,
              [field]: value,
            },
          },
        });
      }
    } else if (name.startsWith('budget.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        budget: {
          ...formData.budget,
          [field]: field === 'amount' ? value : value,
        },
      });
    } else if (name.startsWith('weddingDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        weddingDetails: {
          ...formData.weddingDetails,
          [field]: value,
        },
      });
    } else if (name.startsWith('socialGatheringDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        socialGatheringDetails: {
          ...formData.socialGatheringDetails,
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
      const submitData: any = {
        ...formData,
        guestCount: Number(formData.guestCount),
        budget: formData.budget.amount ? {
          amount: Number(formData.budget.amount),
          currency: formData.budget.currency,
        } : undefined,
      };

      if (formData.eventType === 'Wedding') {
        submitData.weddingDetails = formData.weddingDetails;
      } else {
        submitData.socialGatheringDetails = formData.socialGatheringDetails;
      }

      const res = await eventAPI.create(submitData);
      const newEventId = res.data?._id;

      if (newEventId) {
        // Redirect to vendor planner
        navigate(`/events/${newEventId}/plan`);
      } else {
        navigate('/events');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to create event';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <button onClick={() => navigate('/events')} className="btn btn-secondary">
          ← Back
        </button>
      </div>

      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create New Event</h2>
        {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Type *</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
            >
              <option value="Wedding">Wedding</option>
              <option value="Social Gathering">Social Gathering</option>
            </select>
          </div>

          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Guest Count *</label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Venue Details</h3>
          <div className="form-group">
            <label>Venue Name</label>
            <input
              type="text"
              name="venue.name"
              value={formData.venue.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Street</label>
            <input
              type="text"
              name="venue.address.street"
              value={formData.venue.address.street}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="venue.address.city"
                value={formData.venue.address.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="venue.address.state"
                value={formData.venue.address.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="venue.address.pincode"
                value={formData.venue.address.pincode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Venue Type</label>
              <select
                name="venue.type"
                value={formData.venue.type}
                onChange={handleChange}
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Budget (₹)</label>
            <input
              type="number"
              name="budget.amount"
              value={formData.budget.amount}
              onChange={handleChange}
              min="0"
            />
          </div>

          {formData.eventType === 'Wedding' && (
            <>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Wedding Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Bride Name</label>
                  <input
                    type="text"
                    name="weddingDetails.brideName"
                    value={formData.weddingDetails.brideName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Groom Name</label>
                  <input
                    type="text"
                    name="weddingDetails.groomName"
                    value={formData.weddingDetails.groomName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {formData.eventType === 'Social Gathering' && (
            <>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Social Gathering Details</h3>
              <div className="form-group">
                <label>Occasion Type</label>
                <select
                  name="socialGatheringDetails.occasionType"
                  value={formData.socialGatheringDetails.occasionType}
                  onChange={handleChange}
                >
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Festival Celebration">Festival Celebration</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Host Name</label>
                <input
                  type="text"
                  name="socialGatheringDetails.hostName"
                  value={formData.socialGatheringDetails.hostName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Theme</label>
                <input
                  type="text"
                  name="socialGatheringDetails.theme"
                  value={formData.socialGatheringDetails.theme}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Event...' : 'Create & Plan Vendors'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
