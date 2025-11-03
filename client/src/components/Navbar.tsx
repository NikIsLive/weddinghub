import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoUrl from '../assets/logo.svg';

const linkClass = 'relative px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white';

const Underline = () => (
  <motion.span
    layoutId="nav-underline"
    className="absolute left-2 right-2 -bottom-0.5 h-0.5 bg-white/70 rounded"
    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
  />
);

const Navbar: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem: React.FC<{ to: string; label: string }> = ({ to, label }) => (
    <NavLink to={to} className={({ isActive }) => linkClass + (isActive ? ' text-white' : '')}>
      {({ isActive }) => (
        <span className="relative">
          {label}
          <AnimatePresence initial={false}>{isActive && <Underline />}</AnimatePresence>
        </span>
      )}
    </NavLink>
  );

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 ${elevated ? 'shadow-lg' : 'shadow'} bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur border-b border-white/20`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="WeddingHub" className="h-8 w-8 rounded-lg ring-1 ring-white/40" />
            <div className="leading-tight">
              <div className="text-white font-extrabold text-lg tracking-wide">WeddingHub</div>
              <div className="text-white/80 text-[10px] uppercase tracking-widest">Plan • Book • Celebrate</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {token ? (
              <>
                <NavItem to="/" label="Dashboard" />
                <NavItem to="/events" label="Events" />
                <NavItem to="/vendors" label="Vendors" />
                <NavItem to="/bookings" label="Bookings" />
                {!user?.isVendor && <NavItem to="/vendor-onboarding" label="Become a Vendor" />}
                <div className="ml-2 flex items-center gap-3">
                  {user && (
                    <div className="hidden lg:flex items-center gap-2 text-white/90 text-sm">
                      <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center font-semibold text-white">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                      <span>{user.name.split(' ')[0]}</span>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-md border border-white/30 bg-white/10 hover:bg-white/20 text-white"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavItem to="/login" label="Login" />
                <NavItem to="/register" label="Register" />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/20 bg-white/10 text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-white/20 bg-gradient-to-r from-primary to-accent"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {token ? (
                <>
                  <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
                  <NavLink to="/events" className={linkClass} onClick={() => setOpen(false)}>Events</NavLink>
                  <NavLink to="/vendors" className={linkClass} onClick={() => setOpen(false)}>Vendors</NavLink>
                  <NavLink to="/bookings" className={linkClass} onClick={() => setOpen(false)}>Bookings</NavLink>
                  {!user?.isVendor && (
                    <NavLink to="/vendor-onboarding" className={linkClass} onClick={() => setOpen(false)}>Become a Vendor</NavLink>
                  )}
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="mt-2 px-3 py-2 rounded-md border border-white/30 bg-white/10 hover:bg-white/20 text-white text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
                  <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>Register</NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
