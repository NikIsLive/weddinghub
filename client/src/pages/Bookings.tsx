import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../api';
import { motion } from 'framer-motion';

interface Booking {
  _id: string;
  eventId: any;
  vendorId: any;
  amount: number;
  status: string;
  paymentStatus: string;
  eventDate: string;
  serviceDetails: any;
}

const statusClass = (status: string) => {
  if (status === 'Completed') return 'bg-green-600';
  if (status === 'Cancelled') return 'bg-rose-600';
  if (status === 'Confirmed') return 'bg-blue-600';
  return 'bg-yellow-600';
};

const payClass = (status: string) => {
  if (status === 'Paid') return 'bg-green-600';
  if (status === 'Partial') return 'bg-yellow-600';
  if (status === 'Refunded') return 'bg-rose-600';
  return 'bg-gray-500';
};

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', paymentStatus: '' });

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params: any = {};
      if (filter.status) params.status = filter.status;
      if (filter.paymentStatus) params.paymentStatus = filter.paymentStatus;

      const response = await bookingAPI.getAll(params);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await bookingAPI.update(bookingId, { status: newStatus });
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-gray-600 mt-1">Track and manage your vendor bookings.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-4 shadow border">
          <h3 className="font-semibold">Filters</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 rounded-md border"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={filter.paymentStatus}
              onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
              className="px-3 py-2 rounded-md border"
            >
              <option value="">All Payment Status</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            <h3 className="text-xl font-semibold">No bookings found</h3>
            <p className="mt-1">Start by creating an event and booking vendors.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="rounded-xl bg-white p-4 shadow border"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{booking.vendorId?.businessName || 'Vendor'}</h3>
                    <p className="text-gray-600 text-sm mt-1"><strong>Event:</strong> {booking.eventId?.eventName || 'N/A'}</p>
                    <p className="text-gray-600 text-sm"><strong>Service:</strong> {booking.serviceDetails?.serviceName || booking.vendorId?.category}</p>
                    <p className="text-gray-600 text-sm"><strong>Event Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
                    <p className="text-primary font-bold text-xl mt-1">₹{booking.amount?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`px-2 py-1 rounded text-white text-xs ${statusClass(booking.status)}`}>{booking.status}</span>
                    <span className={`px-2 py-1 rounded text-white text-xs ${payClass(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                  </div>
                </div>

                {user?.isVendor && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => handleStatusUpdate(booking._id, 'Confirmed')} className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-dark text-sm">Confirm</button>
                    <button onClick={() => handleStatusUpdate(booking._id, 'In Progress')} className="px-3 py-2 rounded-md border hover:bg-gray-50 text-sm">Mark In Progress</button>
                    <button onClick={() => handleStatusUpdate(booking._id, 'Completed')} className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm">Mark Completed</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
