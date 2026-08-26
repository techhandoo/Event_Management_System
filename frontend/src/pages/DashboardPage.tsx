import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';
import { Booking } from '../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalBookings: 0, confirmedBookings: 0, cancelledBookings: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/bookings/my?page=0&size=50');
      const data = res.data.data;
      const bookingList: Booking[] = data.content || [];
      setBookings(bookingList);

      const confirmed = bookingList.filter(b => b.status === 'CONFIRMED');
      const cancelled = bookingList.filter(b => b.status === 'CANCELLED');
      const spent = confirmed.reduce((sum, b) => sum + b.totalCents, 0);

      setStats({
        totalBookings: bookingList.length,
        confirmedBookings: confirmed.length,
        cancelledBookings: cancelled.length,
        totalSpent: spent,
      });
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Ticket className="text-indigo-600" />} label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon={<Calendar className="text-green-600" />} label="Confirmed" value={stats.confirmedBookings} />
        <StatCard icon={<Clock className="text-amber-600" />} label="Cancelled" value={stats.cancelledBookings} />
        <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Total Spent" value={formatCents(stats.totalSpent)} />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/my-bookings" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/events/${booking.eventId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {booking.eventTitle}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.quantity}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCents(booking.totalCents)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.bookedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No bookings yet. <Link to="/events" className="text-indigo-600 hover:underline">Browse events</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
