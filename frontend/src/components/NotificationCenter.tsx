import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, CalendarCheck, CalendarX, RotateCcw, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import { Notification } from '../types';
import { cn } from '../lib/utils';

const TYPE_ICONS: Record<string, React.ReactNode> = {
 BOOKING_CONFIRMED: <CalendarCheck size={14} className="text-emerald-400" />,
 EVENT_REMINDER: <Bell size={14} className="text-brand-400" />,
 EVENT_CANCELLED: <CalendarX size={14} className="text-red-400" />,
 REFUND_PROCESSED: <RotateCcw size={14} className="text-amber-400" />,
};

export default function NotificationCenter() {
 const [open, setOpen] = useState(false);
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const ref = useRef<HTMLDivElement>(null);
 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

 const fetchNotifications = async (signal?: AbortSignal) => {
  try {
   const [n, c] = await Promise.all([
    api.get('/notifications?size=20', { signal }),
    api.get('/notifications/unread-count', { signal }),
   ]);
   setNotifications(n.data.data.content || []);
   setUnreadCount(c.data.data.count ?? c.data.data);
  } catch (err: any) {
   if (err?.response?.status === 401 || err?.response?.status === 403) {
    if (intervalRef.current) clearInterval(intervalRef.current);
   }
  }
 };

 useEffect(() => {
  const controller = new AbortController();
  fetchNotifications(controller.signal);
  intervalRef.current = setInterval(() => fetchNotifications(controller.signal), 30000);
  return () => {
   controller.abort();
   if (intervalRef.current) clearInterval(intervalRef.current);
  };
 }, []);

 useEffect(() => {
  const handler = (e: MouseEvent) => {
   if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
 }, []);

 const markAllRead = async () => {
  try {
   await api.put('/notifications/read-all');
   setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
   setUnreadCount(0);
  } catch {}
 };

 return (
  <div className="relative" ref={ref}>
   <button
    onClick={() => setOpen(!open)}
    className="relative p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors"
   >
    <Bell size={18} className={cn("transition-colors", open ? "text-brand-400" : "text-surface-400")} />
    {unreadCount > 0 && (
     <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-surface-0"
     />
    )}
   </button>

   <AnimatePresence>
    {open && (
     <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <motion.div
       initial={{ opacity: 0, y: -8, scale: 0.96 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       exit={{ opacity: 0, y: -8, scale: 0.96 }}
       transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
       className="absolute right-0 mt-2 w-80 surface-card shadow-dropdown z-50 overflow-hidden"
      >
       <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-surface-800">Notifications</h3>
        <div className="flex items-center gap-1">
         {unreadCount > 0 && (
          <button
           onClick={markAllRead}
           className="text-xs text-brand-400 hover:text-brand-300 font-medium px-2 py-1 rounded-lg hover:bg-brand-500/10 transition-colors"
          >
           Mark all read
          </button>
         )}
         <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/[0.06] rounded-lg transition-colors">
          <X size={14} className="text-surface-400" />
         </button>
        </div>
       </div>

       <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
         <div className="py-10 text-center">
          <AlertCircle size={24} className="text-surface-300 mx-auto mb-2 opacity-40" />
          <p className="text-sm text-surface-400">No notifications yet</p>
         </div>
        ) : (
         notifications.map(n => (
          <div
           key={n.id}
           className={cn(
            "flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] transition-colors",
            !n.isRead ? 'bg-brand-500/[0.04]' : 'hover:bg-white/[0.03]'
           )}
          >
           <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
            {TYPE_ICONS[n.type] || <Bell size={14} className="text-surface-400" />}
           </div>
           <div className="min-w-0 flex-1">
            <p className={cn("text-sm", !n.isRead ? 'font-semibold text-surface-800' : 'text-surface-500')}>
             {n.title}
            </p>
            <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{n.message}</p>
           </div>
           {n.isRead ? (
            <CheckCheck size={14} className="text-surface-300 flex-shrink-0 mt-0.5" />
           ) : (
            <Check size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
           )}
          </div>
         ))
        )}
       </div>
      </motion.div>
     </>
    )}
   </AnimatePresence>
  </div>
 );
}
