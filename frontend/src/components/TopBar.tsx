import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Search, User, Settings, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationCenter from './NotificationCenter';
import StatusBadge from './ui/StatusBadge';
import { cn } from '../lib/utils';

export default function TopBar() {
 const { user, isAuthenticated, logout } = useAuth();
 const navigate = useNavigate();
 const [menuOpen, setMenuOpen] = useState(false);
 const [searchFocused, setSearchFocused] = useState(false);
 const menuRef = useRef<HTMLDivElement>(null);

 const handleLogout = () => { logout(); navigate('/login'); };

 useEffect(() => {
  if (!menuOpen) return;
  const handleClick = (e: MouseEvent) => {
   if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
    setMenuOpen(false);
   }
  };
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
 }, [menuOpen]);

 if (!isAuthenticated) return null;

 return (
  <header className="h-16 bg-surface-0/95 border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
   {/* Search */}
   <div className="flex-1 max-w-md">
    <div className={cn(
     "relative transition-all duration-200",
     searchFocused && "max-w-lg"
    )}>
     <Search className={cn(
      "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
      searchFocused ? "text-brand-400" : "text-surface-400"
     )} />
     <input
      type="text"
      className={cn(
       "input pl-10 h-10 bg-surface-50 border-white/[0.06] text-sm",
       searchFocused && "ring-2 ring-brand-500/20 border-brand-500/30"
      )}
      placeholder="Search events, bookings..."
      onFocus={() => setSearchFocused(true)}
      onBlur={() => setSearchFocused(false)}
      onKeyDown={(e) => {
       if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
        navigate(`/events?q=${(e.target as HTMLInputElement).value}`);
       }
      }}
     />
    </div>
   </div>

   {/* Right */}
   <div className="flex items-center gap-2 ml-4">
    <NotificationCenter />

    <div className="relative" ref={menuRef}>
     <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all duration-150"
     >
      <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
       {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div className="text-left hidden sm:block">
       <p className="text-sm font-medium text-surface-800 leading-tight">{user?.fullName}</p>
       <StatusBadge status={user?.role || 'ATTENDEE'} className="!text-[9px] !px-1.5 !py-0 !tracking-wider" />
      </div>
      <ChevronDown size={14} className={cn(
       "text-surface-400 transition-transform duration-200",
       menuOpen && "rotate-180"
      )} />
     </button>

     <AnimatePresence>
      {menuOpen && (
        <motion.div
         initial={{ opacity: 0, y: -8, scale: 0.96 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: -8, scale: 0.96 }}
         transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
         className="absolute right-0 mt-2 w-64 bg-surface-25 border border-white/[0.06] rounded-2xl shadow-dropdown py-1.5"
        >
         <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-surface-800">{user?.fullName}</p>
          <p className="text-xs text-surface-400 mt-0.5">{user?.email}</p>
         </div>
         <div className="py-1.5">
          <button
           onClick={() => { setMenuOpen(false); navigate('/profile'); }}
           className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-500 hover:bg-white/[0.06] hover:text-surface-700 transition-colors"
          >
           <User size={15} /> Profile
          </button>
          <button
           onClick={() => { setMenuOpen(false); navigate('/profile'); }}
           className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-500 hover:bg-white/[0.06] hover:text-surface-700 transition-colors"
          >
           <Settings size={15} /> Settings
          </button>
          <button
           onClick={() => { setMenuOpen(false); toast('Help center coming soon', { icon: '❓' }); }}
           className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-500 hover:bg-white/[0.06] hover:text-surface-700 transition-colors"
          >
           <HelpCircle size={15} /> Help
          </button>
         </div>
         <div className="border-t border-white/[0.06] pt-1.5">
          <button
           onClick={handleLogout}
           className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
           <LogOut size={15} /> Sign out
          </button>
         </div>
        </motion.div>
      )}
     </AnimatePresence>
    </div>
   </div>
  </header>
 );
}
