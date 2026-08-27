import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Event, ApiResponse } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, Users, ArrowLeft, Ticket, Calendar } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { PageLoader } from '../components/ui';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get<ApiResponse<Event>>(`/events/${id}`)
      .then(r => setEvent(r.data.data))
      .catch(() => { toast.error('Event not found'); navigate('/events'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to book'); navigate('/login'); return; }
    setBooking(true);
    try { await api.post('/bookings', { eventId: Number(id), quantity }); toast.success('Booking confirmed'); navigate('/my-bookings'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setBooking(false); }
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;
  if (!event) return null;

  const fmt = (c: number) => c === 0 ? 'Free' : `$${(c / 100).toFixed(2)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const capacityPct = event.capacity > 0 ? Math.round(((event.capacity - event.availableCapacity) / event.capacity) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/events')} className="btn-ghost text-sm mb-4 -ml-2">
          <ArrowLeft size={16} /> Back to events
        </button>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          {/* Hero image */}
          <div className="h-56 sm:h-72 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center relative">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-7xl font-bold opacity-10">{event.title[0]}</span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-surface-800 mb-2">{event.title}</h1>
                {event.category && <span className="badge-brand">{event.category}</span>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-brand-600">{fmt(event.priceCents)}</div>
                <div className="text-xs text-surface-400">per ticket</div>
              </div>
            </div>

            {/* Info + Booking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-5">
                <InfoRow icon={<Calendar size={18} className="text-brand-500" />} label={fmtDate(event.startTime)} sub={`to ${fmtDate(event.endTime)}`} />
                <InfoRow icon={<MapPin size={18} className="text-brand-500" />} label={event.venue} sub={event.city} />
                <InfoRow icon={<Users size={18} className="text-brand-500" />} label={`${event.availableCapacity} spots available`} sub={`out of ${event.capacity} total`} />
                {/* Capacity bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-1.5">
                    <span>{capacityPct}% filled</span>
                    <span>{event.bookedCount} / {event.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Booking widget */}
              <div className="bg-surface-50 rounded-xl p-6 border border-surface-150">
                <h3 className="text-sm font-semibold text-surface-800 mb-4">Book tickets</h3>
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-surface-600 font-medium">Quantity</label>
                  <select
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="input w-24 h-9"
                  >
                    {Array.from({ length: Math.min(10, event.availableCapacity) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="text-lg font-bold text-surface-800 mb-4">
                  Total: {event.priceCents === 0 ? 'Free' : `$${((event.priceCents * quantity) / 100).toFixed(2)}`}
                </div>
                <button
                  onClick={handleBook}
                  disabled={booking || event.availableCapacity === 0}
                  className="btn-primary w-full h-11"
                >
                  <Ticket size={16} /> {booking ? 'Booking...' : event.availableCapacity === 0 ? 'Sold out' : 'Book now'}
                </button>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-sm font-semibold text-surface-800 mb-2">About this event</h3>
                <p className="text-sm text-surface-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-surface-100 text-xs text-surface-400">
              Organized by {event.organizerName}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-surface-800">{label}</p>
        <p className="text-xs text-surface-500">{sub}</p>
      </div>
    </div>
  );
}
