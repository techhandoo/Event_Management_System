import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Event, PagedResponse, ApiResponse } from '../types';
import { MapPin, Clock, Users, Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'Conference', 'Workshop', 'Meetup', 'Concert', 'Sports',
  'Exhibition', 'Seminar', 'Networking', 'Festival', 'Charity',
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      if (debouncedSearch.length >= 2) {
        // Use server-side search
        const response = await api.get<ApiResponse<PagedResponse<Event>>>('/events/search', {
          params: { q: debouncedSearch, page, size: 9 },
        });
        setEvents(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } else {
        // Use standard listing with filters
        const params: Record<string, any> = { page, size: 9 };
        if (cityFilter) params.city = cityFilter;
        if (categoryFilter) params.category = categoryFilter;
        const response = await api.get<ApiResponse<PagedResponse<Event>>>('/events', { params });
        setEvents(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [page, cityFilter, categoryFilter, debouncedSearch]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Reset page when search/filter changes
  useEffect(() => { setPage(0); }, [debouncedSearch, cityFilter, categoryFilter]);

  const formatPrice = (cents: number) => cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const capacityColor = (available: number) => {
    if (available <= 0) return 'text-red-600';
    if (available <= 10) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Search events by name, city, or description..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 mt-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Filter by city"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {(cityFilter || categoryFilter) && (
              <button
                onClick={() => { setCityFilter(''); setCategoryFilter(''); }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No events found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-5xl font-bold opacity-20">{event.title[0]}</span>
                  )}
                  {event.status !== 'PUBLISHED' && (
                    <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {event.status}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                    <span className="text-sm font-bold text-indigo-600 whitespace-nowrap ml-2">
                      {formatPrice(event.priceCents)}
                    </span>
                  </div>
                  {event.category && (
                    <span className="inline-block text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full mb-3 font-medium">
                      {event.category}
                    </span>
                  )}
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(event.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className={capacityColor(event.availableCapacity)}>
                        {event.availableCapacity > 0 ? `${event.availableCapacity} spots left` : 'Sold out'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
