import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, CalendarCheck, CalendarX, RotateCcw, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import { Notification } from '../types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  BOOKING_CONFIRMED: <CalendarCheck size={16} className="text-emerald-500" />,
  EVENT_REMINDER: <Bell size={16} className="text-brand-600" />,
  EVENT_CANCELLED: <CalendarX size={16} className="text-red-500" />,
  REFUND_PROCESSED: <RotateCcw size={16} className="text-amber-500" />,
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (signal?: AbortSignal) => {
    try {
      const [n, c] = await Promise.all([
        api.get('/notifications?size=20', { signal }),
        api.get('/notifications/unread-count', { signal }),
      ]);
      setNotifications(n.data.data.content || []);
      setUnreadCount(c.data.data.count ?? c.data.data);
    } catch (err: any) {
      // Stop polling on auth errors (401/403) — user needs to re-login
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
  };

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        className="relative p-2 rounded-lg hover:bg-surface-50 transition-colors"
      >
        <Bell size={18} className="text-surface-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full ring-2 ring-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-surface-150 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <h3 className="text-sm font-semibold text-surface-800">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded-md hover:bg-brand-50 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-50 rounded-md transition-colors">
                  <X size={14} className="text-surface-400" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertCircle size={24} className="text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-surface-50 transition-colors ${
                      !n.isRead ? 'bg-brand-50/30' : 'hover:bg-surface-25'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {TYPE_ICONS[n.type] || <Bell size={16} className="text-surface-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold text-surface-800' : 'font-medium text-surface-600'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {n.isRead ? (
                      <CheckCheck size={14} className="text-surface-300 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Check size={14} className="text-brand-600 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
