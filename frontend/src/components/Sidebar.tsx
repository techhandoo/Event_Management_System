import { Link, useLocation } from 'react-router-dom';
import { useAuth, homeForRole } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
 LayoutDashboard, Ticket, Shield, PlusCircle,
 ChevronLeft, ChevronRight, Search, BarChart3, Users, LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

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
   animate={{ width: collapsed ? 72 : 260 }}
   transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
   className="fixed left-0 top-0 h-screen bg-surface-25 border-r border-white/[0.06] z-40 flex flex-col"
  >
   {/* Brand */}
   <div className="h-16 flex items-center border-b border-white/[0.06] px-4">
    <Link to={homeForRole(user?.role)} className="flex items-center gap-3 overflow-hidden group">
     <div className="relative flex-shrink-0 w-9 h-9">
      <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
       <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
       </svg>
      </div>
     </div>
     <AnimatePresence>
      {!collapsed && (
       <motion.span
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.15 }}
        className="text-lg font-bold text-surface-900 whitespace-nowrap overflow-hidden"
       >
        <span>Event</span><span className="text-brand-400">ry</span>
       </motion.span>
      )}
     </AnimatePresence>
    </Link>
   </div>

   {/* Navigation */}
   <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
    {filteredItems.map((item, i) => {
     if (item.divider && !item.label) {
      return <div key={i} className="my-3 divider mx-1" />;
     }
     const isActive = location.pathname === item.href ||
      (item.href !== '/events' && location.pathname.startsWith(item.href));
     return (
      <Link
       key={item.href + i}
       to={item.href}
       className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        isActive
         ? "text-white"
         : "text-surface-400 hover:bg-white/[0.04] hover:text-surface-600"
       )}
       title={collapsed ? item.label : undefined}
      >
       {isActive && (
        <motion.div
         layoutId="sidebar-active"
         className="absolute inset-0 bg-brand-500/15 rounded-xl border border-brand-500/20"
         transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
       )}
       <span className={cn(
        "relative z-10 flex-shrink-0 transition-colors",
        isActive ? "text-brand-400" : "text-surface-400 group-hover:text-surface-500"
       )}>
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

   {/* User pill + collapse */}
   <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
    <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl", collapsed ? "justify-center" : "")}>
     <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
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
        <p className="text-[10px] text-surface-400 truncate uppercase tracking-wider font-semibold">{user?.role}</p>
       </motion.div>
      )}
     </AnimatePresence>
    </div>

    <div className="flex items-center gap-1.5">
     <button
      onClick={toggle}
      className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-surface-400 hover:text-surface-600 hover:bg-white/[0.04] rounded-xl transition-colors flex-1"
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
        className="p-2 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-shrink-0"
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
