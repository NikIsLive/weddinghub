import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventAPI, bookingAPI } from '../api';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    bookings: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          eventAPI.getAll(),
          bookingAPI.getAll(),
        ]);

        const events = eventsRes.data;
        const bookings = bookingsRes.data;
        const upcomingEvents = events.filter(
          (e: any) => new Date(e.startDate) > new Date()
        ).length;

        setStats({
          events: events.length,
          bookings: bookings.length,
          upcomingEvents,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-10">Loading...</div>;

  const card = (title: string, value: number, color: string) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl p-6 bg-white/80 backdrop-blur border border-white/30 shadow-md hover:shadow-xl hover:-translate-y-1 transition"
    >
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-10 space-y-6">
          <Hero />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {card('Total Events', stats.events, 'text-primary')}
            {card('Total Bookings', stats.bookings, 'text-green-500')}
            {card('Upcoming Events', stats.upcomingEvents, 'text-yellow-500')}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow border"
          >
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/events" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">View All Events</Link>
              <Link to="/vendors" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">Browse Vendors</Link>
              <Link to="/bookings" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">Manage Bookings</Link>
              {!user?.isVendor && (
                <Link to="/vendor-onboarding" className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Become a Vendor</Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
