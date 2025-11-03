import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI, vendorAPI, bookingAPI, paymentsAPI } from '../api';
import { openRazorpayCheckout } from '../utils/razorpay';
import { motion } from 'framer-motion';

interface Event {
  _id: string;
  eventType: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: any;
  guestCount: number;
  budget: any;
  status: string;
  weddingDetails?: any;
  socialGatheringDetails?: any;
}

const bannerImage: Record<string, string> = {
  Wedding: 'https://images.unsplash.com/photo-1521334726092-b509a19597d3?q=80&w=1600&auto=format&fit=crop',
  'Social Gathering': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
};

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (selectedCategory) {
      fetchVendors();
    }
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [eventRes, bookingsRes] = await Promise.all([
        eventAPI.getById(id!),
        bookingAPI.getAll({ eventId: id }),
      ]);
      setEvent(eventRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAll({ category: selectedCategory });
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const startPaymentForBooking = async (booking: any) => {
    const amountPaise = Math.max(1, Math.round((booking.amount || 0) * 100));
    const orderRes = await paymentsAPI.createOrder({ bookingId: booking._id, amount: amountPaise, currency: 'INR' });
    const { orderId, amount, currency, key } = orderRes.data;

    await openRazorpayCheckout({
      key,
      amount,
      currency,
      name: 'WeddingHub',
      description: `${booking.vendorId?.category || 'Vendor'} booking`,
      order_id: orderId,
      handler: async function (response: any) {
        try {
          await paymentsAPI.verify({
            bookingId: booking._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert('Payment successful, booking confirmed!');
          fetchData();
        } catch (e: any) {
          alert(e?.response?.data?.message || 'Payment verification failed');
        }
      },
      theme: { color: '#667eea' },
      prefill: {},
    });
  };

  const handleCreateBooking = async (vendorId: string) => {
    if (!window.confirm('Are you sure you want to book this vendor?')) return;

    try {
      const vendor = vendors.find((v) => v._id === vendorId);
      const createRes = await bookingAPI.create({
        eventId: id,
        vendorId,
        eventDate: event?.startDate,
        amount: vendor?.priceRange?.min || 0,
        serviceDetails: {
          serviceName: vendor?.category,
        },
      });

      const newBooking = createRes.data;
      await startPaymentForBooking(newBooking);

      setVendors([]);
      setSelectedCategory('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-10">Loading...</div>;
  if (!event) return <div className="text-center text-gray-600 py-20">Event not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow">
          <img src={bannerImage[event.eventType] || bannerImage['Social Gathering']} alt={event.eventType} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/20 text-white text-xs">{event.eventType}</span>
              <span className={`px-2 py-1 rounded text-white text-xs ${event.status === 'Completed' ? 'bg-green-600' : event.status === 'Cancelled' ? 'bg-rose-600' : 'bg-yellow-600'}`}>{event.status}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-2 drop-shadow">{event.eventName}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow border">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <div className="mt-3 text-gray-700 space-y-2">
                <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                <p><strong>Guests:</strong> {event.guestCount}</p>
                {event.venue && (<p><strong>Venue:</strong> {event.venue.name}, {event.venue.address?.city}</p>)}
                {event.budget && (<p><strong>Budget:</strong> ₹{event.budget.amount?.toLocaleString()}</p>)}
                {event.description && (<p className="pt-2">{event.description}</p>)}
              </div>

              {event.eventType === 'Wedding' && event.weddingDetails && (
                <div className="mt-6">
                  <h4 className="font-semibold">Wedding Details</h4>
                  <p className="text-gray-700 mt-2"><strong>Bride:</strong> {event.weddingDetails.brideName}</p>
                  <p className="text-gray-700"><strong>Groom:</strong> {event.weddingDetails.groomName}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow border mt-6">
              <h3 className="text-lg font-semibold">Bookings</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-600 mt-3">No bookings yet</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="p-4 rounded-lg border bg-white/80 backdrop-blur">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{booking.vendorId?.businessName}</div>
                          <div className="text-gray-600 text-sm mt-1">{booking.vendorId?.category} - ₹{booking.amount?.toLocaleString()}</div>
                          <div className="text-gray-600 text-sm">Status: {booking.status}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-white text-xs ${booking.status === 'Completed' ? 'bg-green-600' : booking.status === 'Cancelled' ? 'bg-rose-600' : 'bg-yellow-600'}`}>{booking.status}</span>
                      </div>
                      {booking.paymentStatus !== 'Paid' && (
                        <button className="mt-3 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark" onClick={() => startPaymentForBooking(booking)}>
                          Pay Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <div className="rounded-xl bg-white p-6 shadow border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Book Vendors</h3>
                <Link to={`/events/${id}/plan`} className="text-primary hover:underline">Plan Vendors</Link>
              </div>
              <div className="mt-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border"
                >
                  <option value="">Select a category...</option>
                  <option value="Tent House">Tent House</option>
                  <option value="DJ">DJ</option>
                  <option value="Catering">Catering</option>
                  <option value="Confectioner">Confectioner</option>
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Mehendi Artist">Mehendi Artist</option>
                  <option value="Makeup Artist">Makeup Artist</option>
                  <option value="Bridal Wear">Bridal Wear</option>
                  <option value="Groom Wear">Groom Wear</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Florist">Florist</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Wedding Planner">Wedding Planner</option>
                  <option value="Sound System">Sound System</option>
                  <option value="Generator">Generator</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>

              {vendors.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {vendors.map((vendor) => (
                    <div key={vendor._id} className="p-3 rounded-lg border bg-white/80">
                      <div className="font-semibold">{vendor.businessName}</div>
                      <div className="text-gray-600 text-sm">{vendor.description}</div>
                      <div className="text-gray-700 text-sm mt-1">
                        <strong>Price:</strong> ₹{vendor.priceRange?.min?.toLocaleString()} - ₹{vendor.priceRange?.max?.toLocaleString()}
                      </div>
                      <button onClick={() => handleCreateBooking(vendor._id)} className="mt-2 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-dark w-full">
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow border mt-6">
              <button onClick={() => navigate('/events')} className="px-4 py-2 rounded-md border hover:bg-gray-50 w-full">Back to Events</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
