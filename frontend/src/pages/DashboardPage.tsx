import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import api from '../services/api';
import { Booking } from '../types';
import toast from 'react-hot-toast';
import { StatCard, PageHeader, EmptyState, StatusBadge, PageLoader } from '../components/ui';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my?page=0&size=50')
      .then(r => setBookings(r.data.data.content || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
  const spent = bookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + b.totalCents, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your booking overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Ticket size={20} />} label="Total Bookings" value={bookings.length} accent="brand" delay={0} />
        <StatCard icon={<CheckCircle size={20} />} label="Confirmed" value={confirmed} accent="success" delay={0.05} />
        <StatCard icon={<XCircle size={20} />} label="Cancelled" value={cancelled} accent="danger" delay={0.1} />
        <StatCard icon={<DollarSign size={20} />} label="Total Spent" value={`$${(spent / 100).toFixed(2)}`} accent="warning" delay={0.15} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-surface-700">Recent bookings</h2>
          <Link to="/my-bookings" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">View all</Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6">Event</th>
                <th className="px-6 hidden sm:table-cell">Qty</th>
                <th className="px-6">Total</th>
                <th className="px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td className="px-6">
                    <Link to={`/events/${b.eventId}`} className="text-sm font-medium text-surface-800 hover:text-brand-600">{b.eventTitle}</Link>
                  </td>
                  <td className="px-6 text-sm text-surface-500 hidden sm:table-cell">{b.quantity}</td>
                  <td className="px-6 text-sm font-semibold text-surface-800">{b.totalCents === 0 ? 'Free' : `$${(b.totalCents / 100).toFixed(2)}`}</td>
                  <td className="px-6"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <EmptyState title="No bookings yet" description="Browse events and make your first booking"
            action={<Link to="/events" className="btn-primary btn-sm">Browse events</Link>} />
        )}
      </div>
    </div>
  );
}
