import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Tag, Image, FileText, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PageHeader, FormField } from '../components/ui';

const CATEGORIES = ['Conference', 'Workshop', 'Meetup', 'Concert', 'Sports', 'Exhibition', 'Seminar', 'Networking', 'Festival', 'Charity', 'Other'];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', venue: '', city: '',
    startTime: '', endTime: '', capacity: '', priceCents: '',
    category: '', imageUrl: '',
  });

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.venue || !form.city || !form.startTime || !form.endTime || !form.capacity) {
      toast.error('Fill in all required fields'); return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      toast.error('End time must be after start time'); return;
    }
    setLoading(true);
    try {
      const r = await api.post('/events', {
        title: form.title, description: form.description || undefined,
        venue: form.venue, city: form.city,
        startTime: form.startTime, endTime: form.endTime,
        capacity: parseInt(form.capacity),
        priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : 0,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
      });
      toast.success('Event created as draft');
      navigate(`/events/${r.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm -ml-2">
        <ArrowLeft size={16} /> Back
      </button>
      <PageHeader title="Create new event" description="Fill in the details below. You can publish it later." />

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Info */}
        <div className="p-6 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <FormField label="Event title" icon={<FileText size={14} />} required>
              <input name="title" value={form.title} onChange={set} className="input" placeholder="Annual Tech Conference 2025" required />
            </FormField>
            <FormField label="Description">
              <textarea name="description" value={form.description} onChange={set} rows={3} className="textarea" placeholder="Describe your event..." />
            </FormField>
          </div>
        </div>

        {/* Location & Date */}
        <div className="p-6 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Location & Schedule</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Venue" icon={<MapPin size={14} />} required>
                <input name="venue" value={form.venue} onChange={set} className="input" placeholder="Convention Center" required />
              </FormField>
              <FormField label="City" required>
                <input name="city" value={form.city} onChange={set} className="input" placeholder="San Francisco" required />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Start time" icon={<Calendar size={14} />} required>
                <input type="datetime-local" name="startTime" value={form.startTime} onChange={set} className="input" required />
              </FormField>
              <FormField label="End time" required>
                <input type="datetime-local" name="endTime" value={form.endTime} onChange={set} className="input" required />
              </FormField>
            </div>
          </div>
        </div>

        {/* Pricing & Category */}
        <div className="p-6 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Pricing & Category</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Capacity" icon={<Users size={14} />} required>
                <input type="number" name="capacity" value={form.capacity} onChange={set} min="1" className="input" placeholder="500" required />
              </FormField>
              <FormField label="Price (USD)" icon={<DollarSign size={14} />}>
                <input type="number" name="priceCents" value={form.priceCents} onChange={set} min="0" step="0.01" className="input" placeholder="0.00 for free" />
              </FormField>
            </div>
            <FormField label="Category" icon={<Tag size={14} />}>
              <select name="category" value={form.category} onChange={set} className="input select">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        {/* Media */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Media</h3>
          <FormField label="Image URL" icon={<Image size={14} />}>
            <input type="url" name="imageUrl" value={form.imageUrl} onChange={set} className="input" placeholder="https://..." />
          </FormField>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-surface-100 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 h-11">
            {loading ? 'Creating...' : 'Create event'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary h-11">Cancel</button>
        </div>
      </form>
    </div>
  );
}
