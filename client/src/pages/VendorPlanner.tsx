import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingAPI, vendorAPI, eventAPI } from '../api';

interface Vendor {
  _id: string;
  businessName: string;
  category: string;
  description?: string;
  priceRange?: { min?: number; max?: number };
  ratings?: { average?: number; count?: number };
}

const REQUIRED_WEDDING_CATEGORIES = [
  'Tent House',
  'Catering',
  'DJ',
  'Decoration',
  'Photography',
  'Videography',
  'Makeup Artist',
  'Mehendi Artist',
];

export default function VendorPlanner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [vendorsByCategory, setVendorsByCategory] = useState<Record<string, Vendor[]>>({});
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({});
  const [eventStartDate, setEventStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [catsRes, eventRes] = await Promise.all([
          vendorAPI.getCategories(),
          id ? eventAPI.getById(id) : Promise.resolve({ data: null }),
        ] as const);

        const cats: string[] = catsRes.data || [];
        setAllCategories(cats);

        // Preselect common wedding categories
        setSelectedCategories((prev) =>
          prev.length ? prev : REQUIRED_WEDDING_CATEGORIES.filter((c) => cats.includes(c))
        );

        const evt = eventRes?.data;
        if (evt?.startDate) setEventStartDate(evt.startDate);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    const fetchFor = async (category: string) => {
      if (vendorsByCategory[category]) return; // cache
      try {
        const res = await vendorAPI.getAll({ category });
        setVendorsByCategory((m) => ({ ...m, [category]: res.data || [] }));
      } catch {
        setVendorsByCategory((m) => ({ ...m, [category]: [] }));
      }
    };
    selectedCategories.forEach(fetchFor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

  const canSubmit = useMemo(() => {
    return Object.values(selectedVendors).some(Boolean) && !!eventStartDate;
  }, [selectedVendors, eventStartDate]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const chooseVendor = (category: string, vendorId: string) => {
    setSelectedVendors((prev) => ({ ...prev, [category]: vendorId }));
  };

  const createBookings = async () => {
    if (!id || !eventStartDate) return;
    setSubmitting(true);
    try {
      const tasks = Object.entries(selectedVendors)
        .filter(([, vendorId]) => !!vendorId)
        .map(([category, vendorId]) => {
          const vendorList = vendorsByCategory[category] || [];
          const v = vendorList.find((x) => x._id === vendorId);
          const amount = v?.priceRange?.min || 0;
          return bookingAPI.create({
            eventId: id,
            vendorId,
            eventDate: eventStartDate,
            amount,
            serviceDetails: { serviceName: category },
          });
        });

      await Promise.all(tasks);
      alert('Bookings created successfully');
      navigate(`/events/${id}`);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to create bookings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" onClick={() => navigate(`/events/${id}`)}>← Back</button>
          <h1 className="page-title" style={{ marginTop: '1rem' }}>Plan Vendors</h1>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Pick Vendor Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          {allCategories.map((cat) => {
            const active = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleCategory(cat)}
                style={{ padding: '0.5rem 0.75rem' }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories selected</h3>
          <p>Choose one or more categories above to browse vendors.</p>
        </div>
      ) : (
        selectedCategories.map((cat) => (
          <div key={cat} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{cat}</h3>
              <span className="badge badge-primary">
                {vendorsByCategory[cat]?.length || 0} vendors
              </span>
            </div>

            {vendorsByCategory[cat] && vendorsByCategory[cat].length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {vendorsByCategory[cat].map((v) => {
                  const checked = selectedVendors[cat] === v._id;
                  return (
                    <div key={v._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{v.businessName}</strong>
                        <input type="radio" name={`pick-${cat}`} checked={checked} onChange={() => chooseVendor(cat, v._id)} />
                      </div>
                      {v.description && (
                        <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>{v.description}</p>
                      )}
                      {v.priceRange && (
                        <p style={{ marginTop: 8 }}>
                          <strong>Price:</strong> ₹{v.priceRange.min?.toLocaleString()} - ₹{v.priceRange.max?.toLocaleString()}
                        </p>
                      )}
                      {v.ratings?.average ? (
                        <p style={{ marginTop: 8 }}>⭐ {v.ratings.average.toFixed(1)} ({v.ratings.count || 0})</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#666', marginTop: '0.75rem' }}>No vendors found for this category.</p>
            )}
          </div>
        ))
      )}

      <div className="card" style={{ position: 'sticky', bottom: 0 }}>
        <button className="btn btn-primary" onClick={createBookings} disabled={!canSubmit || submitting} style={{ width: '100%' }}>
          {submitting ? 'Creating bookings...' : 'Create Bookings'}
        </button>
      </div>
    </div>
  );
}
