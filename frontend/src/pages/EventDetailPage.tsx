import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Event, ApiResponse } from '../types';
import toast from 'react-hot-toast';
import { MapPin, Clock, Users, DollarSign, ArrowLeft, Ticket } from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
        setEvent(response.data.data);
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this event');
      navigate('/login');
      return;
    }
    setBooking(true);
    try {
      await api.post('/bookings', { eventId: Number(id), quantity });
      toast.success('Booking confirmed!');
      navigate('/my-bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!event) return null;

  const formatPrice = (cents: number) => cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/events')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Events
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
          <span className="text-white text-7xl font-bold opacity-20">{event.title[0]}</span>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              {event.category && (
                <span className="inline-block text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                  {event.category}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{formatPrice(event.priceCents)}</div>
              <div className="text-sm text-gray-500">per ticket</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="font-medium">{formatDate(event.startTime)}</div>
                  <div className="text-sm text-gray-400">to {formatDate(event.endTime)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="font-medium">{event.venue}</div>
                  <div className="text-sm text-gray-400">{event.city}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="font-medium">{event.availableCapacity} spots available</div>
                  <div className="text-sm text-gray-400">out of {event.capacity} total</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Book Tickets</h3>
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-gray-600">Quantity:</label>
                <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1">
                  {Array.from({ length: Math.min(10, event.availableCapacity) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="text-lg font-semibold mb-4">
                Total: {event.priceCents === 0 ? 'Free' : `$${((event.priceCents * quantity) / 100).toFixed(2)}`}
              </div>
              <button
                onClick={handleBook}
                disabled={booking || event.availableCapacity === 0}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Ticket className="h-5 w-5" />
                {booking ? 'Booking...' : event.availableCapacity === 0 ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          </div>

          {event.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">About This Event</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-400">
            Organized by {event.organizerName}
          </div>
        </div>
      </div>
    </div>
  );
}
