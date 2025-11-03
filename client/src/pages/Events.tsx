import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../api';
import { motion } from 'framer-motion';

interface Event {
  _id: string;
  eventType: string;
  eventName: string;
  startDate: string;
  endDate: string;
  status: string;
  guestCount: number;
}

const heroImages: Record<string, string> = {
  Wedding: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop',
  'Social Gathering': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop'
};

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ eventType: '', status: '' });

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const params: any = {};
      if (filter.eventType) params.eventType = filter.eventType;
      if (filter.status) params.status = filter.status;

      const response = await eventAPI.getAll(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
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
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-gray-600 mt-1">Browse and manage all your events with style.</p>
          </div>
          <Link to="/events/new" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">+ Create Event</Link>
        </div>

        <div className="mt-6 rounded-xl bg-white p-4 shadow border">
          <h3 className="font-semibold">Filters</h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filter.eventType}
              onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
              className="px-3 py-2 rounded-md border"
            >
              <option value="">All Event Types</option>
              <option value="Wedding">Wedding</option>
              <option value="Social Gathering">Social Gathering</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 rounded-md border"
            >
              <option value="">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            <h3 className="text-xl font-semibold">No events found</h3>
            <p className="mt-1">Create your first event to get started!</p>
            <Link to="/events/new" className="inline-block mt-4 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">Create Event</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {events.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="rounded-xl overflow-hidden bg-white shadow hover:shadow-xl border hover:-translate-y-1 transition"
              >
                <Link to={`/events/${event._id}`} className="block">
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={heroImages[event.eventType] || heroImages['Social Gathering']}
                      alt={event.eventType}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-md bg-black/60 text-white">
                      {event.eventType}
                    </span>
                    <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-md ${event.status === 'Completed' ? 'bg-green-600' : event.status === 'Cancelled' ? 'bg-rose-600' : 'bg-yellow-600'} text-white`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{event.eventName}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>Guests:</strong> {event.guestCount}
                    </p>
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

export default Events;
