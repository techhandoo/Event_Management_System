import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Booking, PagedResponse, ApiResponse } from '../types';
import toast from 'react-hot-toast';
import { Ticket, ExternalLink } from 'lucide-react';
import { PageHeader, EmptyState, StatusBadge, PageLoader } from '../components/ui';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<PagedResponse<Booking>>>('/bookings/my', { params: { size: 50 } })
      .then(r => setBookings(r.data.data.content))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setBookings(p => p.map(b => b.id === id ? { ...b, status: 'CANCELLED' as const } : b));
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" description="Manage your event reservations" />

      {bookings.length === 0 ? (
        <EmptyState
          icon={<Ticket size={32} className="text-surface-300" />}
          title="No bookings yet"
          description="Browse events and make your first booking"
          action={<Link to="/events" className="btn-primary btn-sm">Browse events</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-6">Event</th>
                  <th className="px-6 hidden sm:table-cell">Date</th>
                  <th className="px-6">Qty</th>
                  <th className="px-6">Total</th>
                  <th className="px-6">Status</th>
                  <th className="px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="px-6">
                      <Link to={`/events/${b.eventId}`} className="text-sm font-medium text-surface-800 hover:text-brand-600 flex items-center gap-1.5">
                        {b.eventTitle} <ExternalLink size={12} className="text-surface-400" />
                      </Link>
                    </td>
                    <td className="px-6 text-sm text-surface-500 hidden sm:table-cell">
                      {new Date(b.bookedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 text-sm text-surface-600">{b.quantity}</td>
                    <td className="px-6 text-sm font-semibold text-surface-800">
                      {b.totalCents === 0 ? 'Free' : `$${(b.totalCents / 100).toFixed(2)}`}
                    </td>
                    <td className="px-6"><StatusBadge status={b.status} /></td>
                    <td className="px-6 text-right">
                      {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
