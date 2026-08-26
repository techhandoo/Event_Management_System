import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Tag, Image, FileText } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Conference', 'Workshop', 'Meetup', 'Concert', 'Sports',
  'Exhibition', 'Seminar', 'Networking', 'Festival', 'Charity', 'Other',
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    city: '',
    startTime: '',
    endTime: '',
    capacity: '',
    priceCents: '',
    category: '',
    imageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.venue || !form.city || !form.startTime || !form.endTime || !form.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(form.startTime) >= new Date(form.endTime)) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/events', {
        title: form.title,
        description: form.description || undefined,
        venue: form.venue,
        city: form.city,
        startTime: form.startTime,
        endTime: form.endTime,
        capacity: parseInt(form.capacity),
        priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : 0,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
      });

      toast.success('Event created as draft!');
      navigate(`/events/${response.data.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create event';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2"><FileText size={16} /> Event Title *</span>
          </label>
          <input
            type="text" name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Annual Tech Conference 2025"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            rows={4} placeholder="Describe your event..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Venue & City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2"><MapPin size={16} /> Venue *</span>
            </label>
            <input
              type="text" name="venue" value={form.venue} onChange={handleChange}
              placeholder="Convention Center"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text" name="city" value={form.city} onChange={handleChange}
              placeholder="San Francisco"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2"><Calendar size={16} /> Start Time *</span>
            </label>
            <input
              type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
            <input
              type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* Capacity & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2"><Users size={16} /> Capacity *</span>
            </label>
            <input
              type="number" name="capacity" value={form.capacity} onChange={handleChange}
              min="1" placeholder="500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2"><DollarSign size={16} /> Price (USD)</span>
            </label>
            <input
              type="number" name="priceCents" value={form.priceCents} onChange={handleChange}
              min="0" step="0.01" placeholder="0.00 for free"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2"><Tag size={16} /> Category</span>
          </label>
          <select
            name="category" value={form.category} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2"><Image size={16} /> Image URL</span>
          </label>
          <input
            type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange}
            placeholder="https://example.com/event-image.jpg"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition font-medium"
          >
            {loading ? 'Creating...' : 'Create Event (Draft)'}
          </button>
          <button
            type="button" onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
