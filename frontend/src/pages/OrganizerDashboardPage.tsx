import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Eye, Users, Plus, Send, Edit, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import api from '../services/api';
import { Event } from '../types';
import toast from 'react-hot-toast';
import { KPICard, PageHeader, StatusBadge, Pagination, EmptyState, PageLoader, EnterpriseBarChart, DonutChart, ActivityFeed } from '../components/ui';
import type { ActivityItem } from '../components/ui/ActivityFeed';
import { motion } from 'framer-motion';

interface Stats { totalEvents: number; publishedEvents: number; draftEvents: number; totalBookings: number; totalRevenueCents: number; }
interface PagedEvents { content: Event[]; totalPages: number; }

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = async () => {
    try {
      const [s, e] = await Promise.all([
        api.get('/events/my/stats').catch(() => ({ data: { data: { totalEvents: 0, publishedEvents: 0, draftEvents: 0, totalBookings: 0, totalRevenueCents: 0 } } })),
        api.get(`/events/my?page=${page}&size=10`).catch(() => ({ data: { data: { content: [], totalPages: 0 } } })),
      ]);
      setStats(s.data.data);
      const d: PagedEvents = e.data.data;
      setEvents(d.content);
      setTotalPages(d.totalPages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [page]);

  const handlePublish = async (id: number) => { try { await api.put(`/events/${id}/publish`); toast.success('Published'); loadData(); } catch { toast.error('Failed'); } };
  const handleDelete = async (id: number) => { if (!confirm('Cancel this event?')) return; try { await api.delete(`/events/${id}`); toast.success('Cancelled'); loadData(); } catch { toast.error('Failed'); } };
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  // Chart data — derived from real backend stats
  const statusBreakdown = [
    { name: 'Published', value: stats?.publishedEvents || 0, color: '#10B981' },
    { name: 'Draft', value: stats?.draftEvents || 0, color: '#F59E0B' },
    { name: 'Cancelled', value: Math.max(0, (stats?.totalEvents || 0) - (stats?.publishedEvents || 0) - (stats?.draftEvents || 0)), color: '#EF4444' },
  ];

  // Use real event data to build per-month revenue from events
  const buildMonthlyFromEvents = (evts: Event[], extract: (e: Event) => number) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const map: Record<string, number> = {};
    evts.forEach(e => {
      const d = new Date(e.createdAt);
      const key = months[d.getMonth()];
      map[key] = (map[key] || 0) + extract(e);
    });
    // Show last 6 months including current
    const result: { name: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = months[d.getMonth()];
      result.push({ name: key, value: map[key] || 0 });
    }
    return result;
  };

  const monthlyRevenue = events.length > 0
    ? buildMonthlyFromEvents(events, e => e.priceCents * e.bookedCount)
    : [{ name: 'Total', value: stats?.totalRevenueCents || 0 }];

  const monthlyBookings = events.length > 0
    ? buildMonthlyFromEvents(events, e => e.bookedCount)
    : [{ name: 'Total', value: stats?.totalBookings || 0 }];

  // Activity feed
  const activities: ActivityItem[] = events.slice(0, 6).map(ev => ({
    id: ev.id,
    icon: ev.status === 'PUBLISHED' ? <Send size={12} className="text-emerald-600" /> : <Calendar size={12} className="text-amber-600" />,
    iconBg: ev.status === 'PUBLISHED' ? 'bg-emerald-50' : 'bg-amber-50',
    title: ev.status === 'PUBLISHED' ? `Event published` : `Event in draft`,
    description: `${ev.title} — ${ev.city}`,
    timestamp: new Date(ev.createdAt).toLocaleDateString(),
  }));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Organizer Hub" description="Manage your events and track performance"
        action={<Link to="/events/create" className="btn-primary"><Plus size={16} /> New event</Link>} />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Calendar size={20} />} label="Total Events" value={stats?.totalEvents || 0}
          accent="brand" delay={0} />
        <KPICard icon={<Eye size={20} />} label="Published" value={stats?.publishedEvents || 0}
          accent="success" delay={0.05} />
        <KPICard icon={<Users size={20} />} label="Total Bookings" value={stats?.totalBookings || 0}
          accent="warning" delay={0.1} />
        <KPICard icon={<DollarSign size={20} />} label="Revenue" value={fmt(stats?.totalRevenueCents || 0)}
          accent="brand" delay={0.15} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Revenue Overview</h3>
              <p className="text-xs text-surface-400 mt-0.5">Monthly revenue in cents</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-surface-400 font-semibold bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
              <TrendingUp size={12} /> Revenue
            </div>
          </div>
          <div className="p-4">
            <EnterpriseBarChart data={monthlyRevenue} height={240} color="#0070F3" />
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-800">Event Status</h3>
            <p className="text-xs text-surface-400 mt-0.5">Breakdown by status</p>
          </div>
          <div className="p-4">
            <DonutChart
              data={statusBreakdown}
              centerValue={String(stats?.totalEvents || 0)}
              centerLabel="Total Events"
              height={180}
              innerRadius={55}
              outerRadius={80}
            />
            <div className="flex items-center justify-center gap-4 mt-2">
              {statusBreakdown.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-surface-500">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bookings Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bookings Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Bookings Trend</h3>
              <p className="text-xs text-surface-400 mt-0.5">Monthly booking volume</p>
            </div>
            <BarChart3 size={16} className="text-surface-400" />
          </div>
          <div className="p-4">
            <EnterpriseBarChart data={monthlyBookings} height={200} color="#10B981" />
          </div>
        </motion.div>

        {/* Activity Feed */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700">Recent Activity</h3>
          </div>
          <div className="px-6 py-2">
            {activities.length > 0 ? (
              <ActivityFeed items={activities} maxItems={5} />
            ) : (
              <p className="text-sm text-surface-400 text-center py-8">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-sm font-semibold text-surface-700">My Events</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6">Event</th>
                <th className="px-6 hidden sm:table-cell">Date</th>
                <th className="px-6 hidden md:table-cell">Capacity</th>
                <th className="px-6 hidden md:table-cell">Price</th>
                <th className="px-6">Status</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-surface-25 transition-colors">
                  <td className="px-6">
                    <Link to={`/events/${ev.id}`} className="text-sm font-medium text-surface-800 hover:text-brand-600">{ev.title}</Link>
                    <p className="text-xs text-surface-400">{ev.city}</p>
                  </td>
                  <td className="px-6 text-sm text-surface-500 hidden sm:table-cell">
                    {new Date(ev.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (ev.bookedCount / ev.capacity) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-surface-500 tabular-nums">{ev.bookedCount}/{ev.capacity}</span>
                    </div>
                  </td>
                  <td className="px-6 text-sm font-semibold text-surface-800 tabular-nums hidden md:table-cell">
                    {ev.priceCents === 0 ? 'Free' : `$${(ev.priceCents / 100).toFixed(2)}`}
                  </td>
                  <td className="px-6"><StatusBadge status={ev.status} /></td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ev.status === 'DRAFT' && (
                        <button onClick={() => handlePublish(ev.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors" title="Publish">
                          <Send size={14} />
                        </button>
                      )}
                      <Link to={`/events/${ev.id}/edit`} className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-md transition-colors" title="Edit">
                        <Edit size={14} />
                      </Link>                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Cancel">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <EmptyState title="No events yet" description="Create your first event to get started"
            action={<Link to="/events/create" className="btn-primary btn-sm">Create event</Link>} />
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
