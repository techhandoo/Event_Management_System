import { useState, useEffect } from 'react';
import api from '../services/api';
import { Event, PagedResponse, ApiResponse } from '../types';
import { Calendar, Users, DollarSign, Plus, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get<ApiResponse<PagedResponse<Event>>>('/events/my', { params: { size: 50 } });
        setEvents(response.data.data.content);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const totalBookings = events.reduce((sum, e) => sum + e.bookedCount, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.priceCents * e.bookedCount), 0);

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organizer Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary-500" />
            <div>
              <p className="text-sm text-gray-500">My Events</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Event</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Capacity</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Bookings</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Revenue</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{event.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(event.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{event.capacity}</td>
                  <td className="px-6 py-4 text-sm">{event.bookedCount}</td>
                  <td className="px-6 py-4 text-sm">${((event.priceCents * event.bookedCount) / 100).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{event.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No events yet. Create your first event to get started!
          </div>
        )}
      </div>
    </div>
  );
}
