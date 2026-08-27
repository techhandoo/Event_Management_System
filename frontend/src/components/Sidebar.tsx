import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Ticket, Shield, PlusCircle,
  ChevronLeft, ChevronRight, Zap, Search, BarChart3, Users, LogOut
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  divider?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Browse Events', href: '/events', icon: <Search size={18} /> },
  { label: 'My Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['ATTENDEE', 'ORGANIZER', 'ADMIN'] },
  { label: 'My Bookings', href: '/my-bookings', icon: <Ticket size={18} />, roles: ['ATTENDEE', 'ORGANIZER', 'ADMIN'] },
  { label: '', href: '', icon: null, roles: ['ORGANIZER', 'ADMIN'], divider: true },
  { label: 'Create Event', href: '/events/create', icon: <PlusCircle size={18} />, roles: ['ORGANIZER', 'ADMIN'] },
  { label: 'Organizer Hub', href: '/organizer', icon: <BarChart3 size={18} />, roles: ['ORGANIZER', 'ADMIN'] },
  { label: '', href: '', icon: null, roles: ['ADMIN'], divider: true },
  { label: 'Admin Panel', href: '/admin', icon: <Shield size={18} />, roles: ['ADMIN'] },
  { label: 'Users', href: '/admin#users', icon: <Users size={18} />, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const filteredItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  }).filter(item => !(item.divider && !item.label));

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 248 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-surface-150 shadow-sidebar z-40 flex flex-col"
    >
      {/* Brand */}
      <div className="h-16 flex items-center border-b border-surface-100 px-4">
        <Link to="/events" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
            <Zap className="text-white" size={16} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-lg font-bold text-surface-800 whitespace-nowrap overflow-hidden tracking-tight"
              >
                Eventry
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {filteredItems.map((item, i) => {
          if (item.divider && !item.label) {
            return <div key={i} className="my-2 divider mx-2" />;
          }
          const isActive = location.pathname === item.href ||
            (item.href !== '/events' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href + i}
              to={item.href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 group ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-brand-50 rounded-lg"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex-shrink-0 transition-colors ${
                isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'
              }`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User section + collapse */}
      <div className="px-2.5 py-3 border-t border-surface-100 space-y-1">
        {/* User pill */}
        <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <p className="text-sm font-medium text-surface-800 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-surface-400 truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse + Logout */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-surface-400 hover:text-surface-700 hover:bg-surface-50 rounded-lg transition-colors flex-1"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                onClick={() => { logout(); }}
                className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
