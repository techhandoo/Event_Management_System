import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, TrendingUp, Users, Plus, Eye, Edit, Trash2, Send } from 'lucide-react';
import api from '../services/api';
import { Event } from '../types';
import toast from 'react-hot-toast';

interface OrganizerStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalBookings: number;
  totalRevenueCents: number;
  totalAttendees: number;
}

interface PagedEvents {
  content: Event[];
  totalElements: number;
  totalPages: number;
}

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/events/my/stats'),
        api.get(`/events/my?page=${page}&size=10`),
      ]);
      setStats(statsRes.data.data);
      const eventsData: PagedEvents = eventsRes.data.data;
      setEvents(eventsData.content);
      setTotalPages(eventsData.totalPages);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (eventId: number) => {
    try {
      await api.put(`/events/${eventId}/publish`);
      toast.success('Event published!');
      loadData();
    } catch {
      toast.error('Failed to publish event');
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event cancelled');
      loadData();
    } catch {
      toast.error('Failed to cancel event');
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const statusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Calendar className="text-indigo-600" />} label="Total Events" value={stats.totalEvents} />
          <StatCard icon={<Eye className="text-green-600" />} label="Published" value={stats.publishedEvents} />
          <StatCard icon={<Users className="text-blue-600" />} label="Total Bookings" value={stats.totalBookings} />
          <StatCard icon={<DollarSign className="text-emerald-600" />} label="Revenue" value={formatCents(stats.totalRevenueCents)} />
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <Link to={`/events/${event.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {event.title}
                      </Link>
                      <p className="text-sm text-gray-500">{event.city} · {event.venue}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {event.bookedCount}/{event.capacity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCents(event.priceCents)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {event.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(event.id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Publish"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      <Link to={`/events/${event.id}/edit`} className="text-indigo-600 hover:text-indigo-800 p-1" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Cancel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No events yet. <Link to="/events/create" className="text-indigo-600 hover:underline">Create your first event</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
