import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Search } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import StatusBadge from './ui/StatusBadge';

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!isAuthenticated) return null;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-surface-150 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            className="input pl-9 bg-surface-50 h-9 border-surface-200/60"
            placeholder="Search events, bookings..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                navigate(`/events?q=${(e.target as HTMLInputElement).value}`);
              }
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 ml-4">
        <NotificationCenter />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-surface-800 leading-tight">{user?.fullName}</p>
              <StatusBadge status={user?.role || 'ATTENDEE'} className="!text-[9px] !px-1.5 !py-0 !tracking-wider" />
            </div>
            <ChevronDown size={14} className={`text-surface-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dropdown border border-surface-150 z-50 py-1 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-surface-100">
                  <p className="text-sm font-semibold text-surface-800">{user?.fullName}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
