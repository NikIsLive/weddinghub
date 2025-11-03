import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI } from '../api';
import { motion } from 'framer-motion';

interface Vendor {
  _id: string;
  businessName: string;
  category: string;
  description: string;
  address: any;
  priceRange: any;
  ratings: any;
}

const categoryImages: Record<string, string> = {
  'Tent House': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
  DJ: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1600&auto=format&fit=crop',
  Catering: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop',
  Confectioner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1600&auto=format&fit=crop',
  Photography: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?q=80&w=1600&auto=format&fit=crop',
  Videography: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1600&auto=format&fit=crop',
  Decoration: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
  'Mehendi Artist': 'https://images.unsplash.com/photo-1520975020450-4e28b762b3a4?q=80&w=1600&auto=format&fit=crop',
  'Makeup Artist': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop',
  Florist: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?q=80&w=1600&auto=format&fit=crop',
};

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', city: '', search: '' });

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await vendorAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;

      const response = await vendorAPI.getAll(params);
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Vendors</h1>
            <p className="text-gray-600 mt-1">Find the perfect professionals for your event.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-4 shadow border">
          <h3 className="font-semibold">Search & Filter</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search vendors..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 rounded-md border"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 rounded-md border"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-3 py-2 rounded-md border"
            />
          </div>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            <h3 className="text-xl font-semibold">No vendors found</h3>
            <p className="mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {vendors.map((vendor, idx) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="rounded-xl overflow-hidden bg-white shadow hover:shadow-xl border hover:-translate-y-1 transition"
              >
                <Link to={`/vendors/${vendor._id}`} className="block">
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={categoryImages[vendor.category] || 'https://images.unsplash.com/photo-1520975020450-4e28b762b3a4?q=80&w=1600&auto=format&fit=crop'}
                      alt={vendor.category}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-md bg-black/60 text-white">
                      {vendor.category}
                    </span>
                    {vendor.ratings?.average > 0 && (
                      <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md bg-black/60 text-white">
                        ⭐ {vendor.ratings.average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                    {vendor.description && (
                      <p className="text-gray-600 text-sm mt-1">{vendor.description.substring(0, 100)}...</p>
                    )}
                    {vendor.address?.city && (
                      <p className="text-gray-600 text-sm mt-1">📍 {vendor.address.city}</p>
                    )}
                    {vendor.priceRange && (
                      <p className="text-gray-700 text-sm mt-1">
                        <strong>Price:</strong> ₹{vendor.priceRange.min?.toLocaleString()} - ₹{vendor.priceRange.max?.toLocaleString()}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendors;
