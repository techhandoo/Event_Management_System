import { useState, useEffect } from 'react';
import api from '../services/api';
import { Booking, PagedResponse, ApiResponse } from '../types';
import toast from 'react-hot-toast';
import { Ticket, XCircle, Calendar } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await api.get<ApiResponse<PagedResponse<Booking>>>('/bookings/my', { params: { size: 50 } });
      setBookings(response.data.data.content);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="text-center py-12">Loading bookings...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{booking.eventTitle}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />
                    {new Date(booking.bookedAt).toLocaleDateString()}
                  </span>
                  <span>Qty: {booking.quantity}</span>
                  <span>{booking.totalCents === 0 ? 'Free' : `$${(booking.totalCents / 100).toFixed(2)}`}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor(booking.status)}`}>
                  {booking.status}
                </span>
                {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                  <button onClick={() => handleCancel(booking.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm">
                    <XCircle className="h-4 w-4" />Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
