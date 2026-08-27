import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Event, PagedResponse, ApiResponse } from '../types';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Search, SlidersHorizontal, Zap, X, ChevronRight } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';
import { Spinner, EmptyState, Pagination } from '../components/ui';

const CATEGORIES = ['Conference', 'Workshop', 'Meetup', 'Concert', 'Sports', 'Exhibition', 'Seminar', 'Networking', 'Festival', 'Charity'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EventsPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      if (debouncedSearch.length >= 2) {
        const r = await api.get<ApiResponse<PagedResponse<Event>>>('/events/search', { params: { q: debouncedSearch, page, size: 9 } });
        setEvents(r.data.data.content); setTotalPages(r.data.data.totalPages);
      } else {
        const params: Record<string, any> = { page, size: 9 };
        if (cityFilter) params.city = cityFilter;
        if (categoryFilter) params.category = categoryFilter;
        const r = await api.get<ApiResponse<PagedResponse<Event>>>('/events', { params });
        setEvents(r.data.data.content); setTotalPages(r.data.data.totalPages);
      }
    } catch { console.error('Failed to fetch events'); } finally { setLoading(false); }
  }, [page, cityFilter, categoryFilter, debouncedSearch]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setPage(0); }, [debouncedSearch, cityFilter, categoryFilter]);

  const fmt = (c: number) => c === 0 ? 'Free' : `$${(c / 100).toFixed(2)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Public header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-surface-150 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link to="/events" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
              <Zap className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold text-surface-800 tracking-tight">Eventry</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <Link to="/dashboard" className="text-sm text-surface-500 hover:text-surface-800 font-medium hidden sm:block">Dashboard</Link>
                <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm h-9">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-surface-800 tracking-tight">Discover events</h1>
          <p className="text-surface-500 mt-1">Find your next experience</p>
        </motion.div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10 h-11"
              placeholder="Search by name, city, or description..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn h-11 ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-700' : 'btn-secondary'}`}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-white rounded-xl border border-surface-150"
          >
            <input type="text" value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input h-10" placeholder="City" />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input select h-10">
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(cityFilter || categoryFilter) && (
              <button onClick={() => { setCityFilter(''); setCategoryFilter(''); }} className="text-sm text-red-500 hover:text-red-600 font-medium px-3 flex items-center gap-1">
                <X size={14} /> Clear
              </button>
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : events.length === 0 ? (
          <EmptyState icon={<Search size={36} className="text-surface-300" />} title="No events found" description="Try adjusting your search or filters" />
        ) : (
          <>
            <p className="text-sm text-surface-500 mb-4 font-medium">{events.length} event{events.length !== 1 ? 's' : ''}</p>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map(event => (
                <motion.div key={event.id} variants={item}>
                  <Link to={`/events/${event.id}`} className="card-hover overflow-hidden group block h-full">
                    <div className="h-44 bg-gradient-to-br from-brand-500 to-brand-700 relative overflow-hidden">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-5xl font-bold opacity-10">{event.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/95 backdrop-blur-sm text-surface-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs">
                          {fmt(event.priceCents)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-[15px] font-semibold text-surface-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {event.title}
                        </h3>
                        <ChevronRight size={16} className="text-surface-300 group-hover:text-brand-500 flex-shrink-0 mt-0.5 transition-colors" />
                      </div>
                      {event.category && <span className="badge-brand mb-2">{event.category}</span>}
                      <div className="space-y-1.5 text-xs text-surface-500 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-surface-400 flex-shrink-0" />
                          {fmtDate(event.startTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-surface-400 flex-shrink-0" />
                          <span className="line-clamp-1">{event.venue}, {event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-surface-400 flex-shrink-0" />
                          <span className={
                            event.availableCapacity <= 0 ? 'text-red-500 font-medium' :
                            event.availableCapacity <= 10 ? 'text-amber-600 font-medium' :
                            'text-emerald-600 font-medium'
                          }>
                            {event.availableCapacity > 0 ? `${event.availableCapacity} spots left` : 'Sold out'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}
