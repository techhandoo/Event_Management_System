import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Eye, Users, Plus, Send, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Event } from '../types';
import toast from 'react-hot-toast';
import { StatCard, PageHeader, StatusBadge, Pagination, EmptyState, PageLoader } from '../components/ui';

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
      const [s, e] = await Promise.all([api.get('/events/my/stats'), api.get(`/events/my?page=${page}&size=10`)]);
      setStats(s.data.data); const d: PagedEvents = e.data.data; setEvents(d.content); setTotalPages(d.totalPages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [page]);

  const handlePublish = async (id: number) => { try { await api.put(`/events/${id}/publish`); toast.success('Published'); loadData(); } catch { toast.error('Failed'); } };
  const handleDelete = async (id: number) => { if (!confirm('Cancel this event?')) return; try { await api.delete(`/events/${id}`); toast.success('Cancelled'); loadData(); } catch { toast.error('Failed'); } };
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Organizer Hub" description="Manage your events and track performance"
        action={<Link to="/events/create" className="btn-primary"><Plus size={16} /> New event</Link>} />

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Calendar size={20} />} label="Total Events" value={stats.totalEvents} accent="brand" delay={0} />
          <StatCard icon={<Eye size={20} />} label="Published" value={stats.publishedEvents} accent="success" delay={0.05} />
          <StatCard icon={<Users size={20} />} label="Bookings" value={stats.totalBookings} accent="warning" delay={0.1} />
          <StatCard icon={<DollarSign size={20} />} label="Revenue" value={fmt(stats.totalRevenueCents)} accent="brand" delay={0.15} />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-sm font-semibold text-surface-700">My events</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6">Event</th>
                <th className="px-6 hidden sm:table-cell">Date</th>
                <th className="px-6 hidden md:table-cell">Capacity</th>
                <th className="px-6">Status</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td className="px-6">
                    <Link to={`/events/${ev.id}`} className="text-sm font-medium text-surface-800 hover:text-brand-600">{ev.title}</Link>
                    <p className="text-xs text-surface-400">{ev.city}</p>
                  </td>
                  <td className="px-6 text-sm text-surface-500 hidden sm:table-cell">
                    {new Date(ev.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 text-sm text-surface-500 hidden md:table-cell">
                    {ev.bookedCount}/{ev.capacity}
                  </td>
                  <td className="px-6"><StatusBadge status={ev.status} /></td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ev.status === 'DRAFT' && (
                        <button onClick={() => handlePublish(ev.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors" title="Publish">
                          <Send size={14} />
                        </button>
                      )}
                      <Link to={`/events/${ev.id}/edit`} className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-md transition-colors" title="Edit">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Cancel">
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
