import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';
import { ArrowLeft, Save, MapPin, Clock, Tag, DollarSign, Image, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLoader } from '../components/ui/LoadingState';

interface EventForm {
  title: string;
  description: string;
  venue: string;
  city: string;
  startTime: string;
  endTime: string;
  capacity: number;
  priceCents: number;
  category: string;
  imageUrl: string;
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventForm>();

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`)
      .then(r => {
        const ev = r.data.data;
        reset({
          title: ev.title,
          description: ev.description || '',
          venue: ev.venue,
          city: ev.city,
          startTime: ev.startTime?.slice(0, 16),
          endTime: ev.endTime?.slice(0, 16),
          capacity: ev.capacity,
          priceCents: ev.priceCents / 100,
          category: ev.category || '',
          imageUrl: ev.imageUrl || '',
        });
      })
      .catch(() => { toast.error('Event not found'); navigate('/organizer'); })
      .finally(() => setLoading(false));
  }, [id, reset, navigate]);

  const onSubmit = async (data: EventForm) => {
    setSubmitting(true);
    try {
      await api.put(`/events/${id}`, {
        ...data,
        priceCents: Math.round(data.priceCents * 100),
      });
      toast.success('Event updated!');
      navigate('/organizer');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/organizer" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to Organizer Hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="px-6 py-4 border-b border-surface-100">
          <h1 className="text-lg font-bold text-surface-800">Edit Event</h1>
          <p className="text-sm text-surface-500 mt-0.5">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <FileText size={14} className="text-brand-500" /> Basic Information
            </h3>
            <div className="space-y-4">
              <div className="form-item">
                <label className="label">Event title</label>
                <input {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                  className={`input ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Tech Conference 2026" />
                {errors.title && <p className="form-message">{errors.title.message}</p>}
              </div>
              <div className="form-item">
                <label className="label">Description</label>
                <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Describe your event..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-item">
                  <label className="label">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input {...register('category')} className="input pl-10" placeholder="e.g. Conference" />
                  </div>
                </div>
                <div className="form-item">
                  <label className="label">Image URL</label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input {...register('imageUrl')} className="input pl-10" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-100" />

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-brand-500" /> Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-item">
                <label className="label">Venue</label>
                <input {...register('venue', { required: 'Venue is required' })}
                  className={`input ${errors.venue ? 'input-error' : ''}`} placeholder="Convention Center" />
                {errors.venue && <p className="form-message">{errors.venue.message}</p>}
              </div>
              <div className="form-item">
                <label className="label">City</label>
                <input {...register('city', { required: 'City is required' })}
                  className={`input ${errors.city ? 'input-error' : ''}`} placeholder="New York" />
                {errors.city && <p className="form-message">{errors.city.message}</p>}
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-100" />

          {/* Schedule */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <Clock size={14} className="text-brand-500" /> Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-item">
                <label className="label">Start time</label>
                <input type="datetime-local" {...register('startTime', { required: 'Start time is required' })}
                  className={`input ${errors.startTime ? 'input-error' : ''}`} />
                {errors.startTime && <p className="form-message">{errors.startTime.message}</p>}
              </div>
              <div className="form-item">
                <label className="label">End time</label>
                <input type="datetime-local" {...register('endTime', { required: 'End time is required' })}
                  className={`input ${errors.endTime ? 'input-error' : ''}`} />
                {errors.endTime && <p className="form-message">{errors.endTime.message}</p>}
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-100" />

          {/* Pricing & Capacity */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <DollarSign size={14} className="text-brand-500" /> Pricing & Capacity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-item">
                <label className="label">Capacity</label>
                <input type="number" {...register('capacity', { required: 'Capacity is required', min: { value: 1, message: 'Min 1' } })}
                  className={`input ${errors.capacity ? 'input-error' : ''}`} placeholder="100" />
                {errors.capacity && <p className="form-message">{errors.capacity.message}</p>}
              </div>
              <div className="form-item">
                <label className="label">Price ($)</label>
                <input type="number" step="0.01" {...register('priceCents', { min: { value: 0, message: 'Cannot be negative' } })}
                  className="input" placeholder="0.00 for free" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-100">
            <Link to="/organizer" className="btn-ghost">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
