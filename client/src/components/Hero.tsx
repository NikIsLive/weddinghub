import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const gradient = 'bg-gradient-to-br from-primary/20 via-accent/20 to-white';

export default function Hero() {
  const blobRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!blobRef.current) return;
    const el = blobRef.current;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(el, { duration: 6, x: 20, y: 10, rotate: 8, ease: 'sine.inOut' })
      .to(el, { duration: 6, x: -10, y: -6, rotate: -6, ease: 'sine.inOut' });
    return () => { tl.kill(); };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl p-8 md:p-12 ${gradient} shadow-xl border`}>      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900">
          Plan Unforgettable Weddings & Events
        </h1>
        <p className="mt-3 md:mt-4 text-gray-700 max-w-2xl">
          Discover curated vendors, manage bookings, and bring your dream celebration to life with a delightful, modern experience.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-6 flex flex-wrap gap-3"
      >
        <a href="/events/new" className="px-5 py-2 rounded-md bg-primary text-white hover:bg-primary-dark transition shadow">
          Create Event
        </a>
        <a href="/vendors" className="px-5 py-2 rounded-md border border-gray-300 bg-white/80 backdrop-blur hover:bg-white transition">
          Explore Vendors
        </a>
      </motion.div>

      {/* Floating decorative blob */}
      <div ref={blobRef} className="pointer-events-none absolute -right-10 -bottom-10 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-primary/40 to-accent/40 blur-3xl opacity-60" />
    </div>
  );
}
