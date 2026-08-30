import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle, XCircle, DollarSign, Calendar, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api';
import { Booking, Event } from '../types';
import toast from 'react-hot-toast';
import { KPICard, PageHeader, StatusBadge, EmptyState, PageLoader, MiniAreaChart, ActivityFeed } from '../components/ui';
import type { ActivityItem } from '../components/ui/ActivityFeed';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/my?page=0&size=50').catch(() => ({ data: { data: { content: [] } } })),
      api.get('/events?page=0&size=6').catch(() => ({ data: { data: { content: [] } } })),
    ]).then(([b, e]) => {
      setBookings(b.data.data.content || []);
      setUpcoming((e.data.data.content || []).slice(0, 4));
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
  const totalSpent = bookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + b.totalCents, 0);

  // Simulated sparkline data (in production, this would come from an API)
  const monthlyBookings = [
    { label: 'Jan', value: 2 }, { label: 'Feb', value: 5 }, { label: 'Mar', value: 3 },
    { label: 'Apr', value: 8 }, { label: 'May', value: 6 }, { label: 'Jun', value: confirmed || 4 },
  ];

  const monthlySpent = [
    { label: 'Jan', value: 2500 }, { label: 'Feb', value: 4200 }, { label: 'Mar', value: 1800 },
    { label: 'Apr', value: 6100 }, { label: 'May', value: 3900 }, { label: 'Jun', value: totalSpent || 2800 },
  ];

  // Activity feed items
  const activities: ActivityItem[] = bookings.slice(0, 6).map((b) => ({
    id: b.id,
    icon: b.status === 'CONFIRMED' ? <CheckCircle size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-red-600" />,
    iconBg: b.status === 'CONFIRMED' ? 'bg-emerald-50' : 'bg-red-50',
    title: `Booking ${b.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`,
    description: `${b.eventTitle} — $${(b.totalCents / 100).toFixed(2)}`,
    timestamp: new Date(b.bookedAt).toLocaleDateString(),
  }));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your booking overview at a glance" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Ticket size={20} />}
          label="Total Bookings"
          value={bookings.length}
          trend={{ value: 12, label: 'vs last month' }}
          accent="brand"
          delay={0}
        />
        <KPICard
          icon={<CheckCircle size={20} />}
          label="Confirmed"
          value={confirmed}
          trend={{ value: 8, label: 'vs last month' }}
          accent="success"
          delay={0.05}
        />
        <KPICard
          icon={<XCircle size={20} />}
          label="Cancelled"
          value={cancelled}
          trend={{ value: cancelled > 0 ? -3 : 0, label: 'vs last month' }}
          accent="danger"
          delay={0.1}
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Total Spent"
          value={`$${(totalSpent / 100).toFixed(2)}`}
          trend={{ value: 15, label: 'vs last month' }}
          accent="warning"
          delay={0.15}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bookings Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Bookings Trend</h3>
              <p className="text-xs text-surface-400 mt-0.5">Monthly booking count</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Active
            </div>
          </div>
          <div className="p-4">
            <MiniAreaChart data={monthlyBookings} color="#0070F3" height={120} />
          </div>
        </motion.div>

        {/* Spending Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Spending Trend</h3>
              <p className="text-xs text-surface-400 mt-0.5">Monthly expenditure</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
              <DollarSign size={12} />
              Revenue
            </div>
          </div>
          <div className="p-4">
            <MiniAreaChart data={monthlySpent} color="#10B981" height={120} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Upcoming + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-700">Recent Bookings</h3>
            <Link to="/my-bookings" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-6">Event</th>
                  <th className="px-6 hidden sm:table-cell">Date</th>
                  <th className="px-6">Amount</th>
                  <th className="px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-surface-25 transition-colors">
                    <td className="px-6">
                      <Link to={`/events/${b.eventId}`} className="text-sm font-medium text-surface-800 hover:text-brand-600">{b.eventTitle}</Link>
                      <p className="text-xs text-surface-400">{b.eventVenue}</p>
                    </td>
                    <td className="px-6 text-sm text-surface-500 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-surface-400" />
                        {new Date(b.bookedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 text-sm font-semibold text-surface-800 tabular-nums">
                      {b.totalCents === 0 ? 'Free' : `$${(b.totalCents / 100).toFixed(2)}`}
                    </td>
                    <td className="px-6"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <EmptyState
              title="No bookings yet"
              description="Browse events and make your first booking"
              action={<Link to="/events" className="btn-primary btn-sm">Browse events</Link>}
            />
          )}
        </div>

        {/* Activity Feed */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700">Recent Activity</h3>
          </div>
          <div className="px-6 py-2">
            {activities.length > 0 ? (
              <ActivityFeed items={activities} maxItems={5} />
            ) : (
              <p className="text-sm text-surface-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Upcoming Events</h3>
              <p className="text-xs text-surface-400 mt-0.5">Discover what's happening next</p>
            </div>
            <Link to="/events" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
              Browse all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-surface-100">
            {upcoming.map(ev => (
              <Link key={ev.id} to={`/events/${ev.id}`} className="p-5 hover:bg-surface-25 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-brand-500" />
                  <span className="text-xs text-surface-400">{new Date(ev.startTime).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-semibold text-surface-800 group-hover:text-brand-600 transition-colors line-clamp-1">{ev.title}</h4>
                <p className="text-xs text-surface-400 mt-1">{ev.city} · {ev.category || 'General'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-800">{ev.priceCents === 0 ? 'Free' : `$${(ev.priceCents / 100).toFixed(2)}`}</span>
                  <span className="text-xs text-emerald-600 font-medium">{ev.availableCapacity} spots</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
