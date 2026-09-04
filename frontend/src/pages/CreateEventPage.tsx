import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Tag, Image, FileText, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/ui';

const CATEGORIES = ['Conference', 'Workshop', 'Meetup', 'Concert', 'Sports', 'Exhibition', 'Seminar', 'Networking', 'Festival', 'Charity', 'Other'];

interface FieldErrors {
 [key: string]: string;
}

export default function CreateEventPage() {
 const navigate = useNavigate();
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState<FieldErrors>({});
 const [touched, setTouched] = useState<Record<string, boolean>>({});
 const [form, setForm] = useState({
  title: '', description: '', venue: '', city: '',
  startTime: '', endTime: '', capacity: '', priceCents: '',
  category: '', imageUrl: '',
 });

 const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
  // Clear field error when user types
  if (errors[name]) {
   setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  }
 };

 const markTouched = (field: string) => {
  setTouched(prev => ({ ...prev, [field]: true }));
 };

 // Client-side validation before submit
 const validate = (): FieldErrors => {
  const e: FieldErrors = {};

  if (!form.title.trim()) {
   e.title = 'Event name is required';
  } else if (form.title.trim().length < 3) {
   e.title = 'Name must be at least 3 characters (e.g. "Tech Summit 2026")';
  } else if (form.title.trim().length > 200) {
   e.title = 'Name must be under 200 characters';
  }

  if (form.description && form.description.length > 5000) {
   e.description = `Description is too long (${form.description.length}/5000 characters)`;
  }

  if (!form.venue.trim()) {
   e.venue = 'Venue is required — where is the event held?';
  }

  if (!form.city.trim()) {
   e.city = 'City is required (e.g. "Singapore" or "New York")';
  }

  if (!form.startTime) {
   e.startTime = 'Pick when the event starts';
  } else {
   const start = new Date(form.startTime + ':00');
   if (start <= new Date()) {
    e.startTime = 'Start time must be in the future — pick a later date & time';
   }
  }

  if (!form.endTime) {
   e.endTime = 'Pick when the event ends';
  } else if (form.startTime && new Date(form.startTime + ':00') >= new Date(form.endTime + ':00')) {
   e.endTime = 'End time must be after the start time';
  }

  if (!form.capacity) {
   e.capacity = 'Set a capacity — how many people can attend?';
  } else if (parseInt(form.capacity) < 1) {
   e.capacity = 'Capacity must be at least 1';
  } else if (parseInt(form.capacity) > 100000) {
   e.capacity = 'Capacity cannot exceed 100,000';
  }

  if (form.priceCents && parseFloat(form.priceCents) < 0) {
   e.priceCents = 'Price cannot be negative — enter 0 for free events';
  }

  if (form.imageUrl && !form.imageUrl.startsWith('http')) {
   e.imageUrl = 'Image URL must start with http:// or https://';
  }

  return e;
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const clientErrors = validate();
  if (Object.keys(clientErrors).length > 0) {
   setErrors(clientErrors);
   // Mark all error fields as touched
   const touchedAll: Record<string, boolean> = {};
   Object.keys(clientErrors).forEach(k => touchedAll[k] = true);
   setTouched(prev => ({ ...prev, ...touchedAll }));
   toast.error('Please fix the highlighted fields below');
   return;
  }

  setLoading(true);
  try {
   const r = await api.post('/events', {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    venue: form.venue.trim(),
    city: form.city.trim(),
    startTime: form.startTime + ':00',
    endTime: form.endTime + ':00',
    capacity: parseInt(form.capacity),
    priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : 0,
    category: form.category || undefined,
    imageUrl: form.imageUrl || undefined,
   });
   toast.success('Event created as draft! 🎉');
   navigate(`/events/${r.data.data.id}`);
  } catch (err: any) {
   const data = err.response?.data;
   if (data?.data && typeof data.data === 'object') {
    // Map backend field names to friendly labels
    const friendlyNames: Record<string, string> = {
     title: 'Event title',
     description: 'Description',
     venue: 'Venue',
     city: 'City',
     startTime: 'Start time',
     endTime: 'End time',
     capacity: 'Capacity',
     priceCents: 'Price',
     category: 'Category',
     imageUrl: 'Image URL',
    };
    const newErrors: FieldErrors = {};
    Object.entries(data.data).forEach(([field, msg]) => {
     newErrors[field] = String(msg);
     toast.error(`${friendlyNames[field] || field}: ${msg}`);
    });
    setErrors(newErrors);
   } else {
    toast.error(data?.message || 'Something went wrong. Please try again.');
   }
  } finally { setLoading(false); }
 };

 // Helper component for inline error + hint
 const FieldHelp = ({ field, hint }: { field: string; hint?: string }) => (
  <div className="mt-1.5 min-h-[20px]">
   {errors[field] && touched[field] ? (
    <p className="text-xs text-red-400 flex items-start gap-1.5">
     <span className="mt-0.5 shrink-0">⚠</span>
     {errors[field]}
    </p>
   ) : hint ? (
    <p className="text-xs text-surface-500 flex items-start gap-1.5">
     <Info size={11} className="mt-0.5 shrink-0 opacity-60" />
     {hint}
    </p>
   ) : null}
  </div>
 );

 return (
  <div className="max-w-2xl mx-auto space-y-6">
   <button onClick={() => navigate(-1)} className="btn-ghost text-sm -ml-2">
    <ArrowLeft size={16} /> Back
   </button>
   <PageHeader title="Create new event" description="Fill in the details below. You can publish it later from your dashboard." />

   <form onSubmit={handleSubmit} className="card">
    {/* Basic Info */}
    <div className="p-6 border-b border-surface-100">
     <div className="flex items-center gap-2 mb-1">
      <h3 className="text-sm font-semibold text-surface-700">Basic Information</h3>
      <span className="text-xs text-surface-400">— required for attendees to find your event</span>
     </div>
     <div className="space-y-4 mt-4">
      <div>
       <label className="form-label">
        <FileText size={13} /> Event title <span className="text-red-400">*</span>
       </label>
       <input
        name="title" value={form.title} onChange={set}
        onBlur={() => markTouched('title')}
        className={`input ${errors.title && touched.title ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
        placeholder="e.g. Annual Tech Conference 2026"
       />
       <FieldHelp field="title" hint="3–200 characters. Choose something catchy that describes your event." />
      </div>
      <div>
       <label className="form-label">
        <FileText size={13} /> Description
       </label>
       <textarea
        name="description" value={form.description} onChange={set}
        onBlur={() => markTouched('description')}
        rows={3} className={`textarea ${errors.description && touched.description ? 'border-red-500/50' : ''}`}
        placeholder="What's the event about? What can attendees expect?"
       />
       <FieldHelp field="description" hint={`Optional. Up to 5,000 characters. ${form.description.length}/5000`} />
      </div>
     </div>
    </div>

    {/* Location & Date */}
    <div className="p-6 border-b border-surface-100">
     <div className="flex items-center gap-2 mb-1">
      <h3 className="text-sm font-semibold text-surface-700">Location & Schedule</h3>
      <span className="text-xs text-surface-400">— tell people where and when</span>
     </div>
     <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="form-label">
         <MapPin size={13} /> Venue <span className="text-red-400">*</span>
        </label>
        <input
         name="venue" value={form.venue} onChange={set}
         onBlur={() => markTouched('venue')}
         className={`input ${errors.venue && touched.venue ? 'border-red-500/50' : ''}`}
         placeholder="e.g. Marina Bay Sands Expo"
        />
        <FieldHelp field="venue" hint="Building name, hall, or street address." />
       </div>
       <div>
        <label className="form-label">
         <MapPin size={13} /> City <span className="text-red-400">*</span>
        </label>
        <input
         name="city" value={form.city} onChange={set}
         onBlur={() => markTouched('city')}
         className={`input ${errors.city && touched.city ? 'border-red-500/50' : ''}`}
         placeholder="e.g. Singapore, New York, London"
        />
        <FieldHelp field="city" hint="City or metro area. Helps attendees discover local events." />
       </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="form-label">
         <Calendar size={13} /> Start time <span className="text-red-400">*</span>
        </label>
        <input
         type="datetime-local" name="startTime" value={form.startTime} onChange={set}
         onBlur={() => markTouched('startTime')}
         className={`input ${errors.startTime && touched.startTime ? 'border-red-500/50' : ''}`}
        />
        <FieldHelp field="startTime" hint="Must be a future date and time." />
       </div>
       <div>
        <label className="form-label">
         <Calendar size={13} /> End time <span className="text-red-400">*</span>
        </label>
        <input
         type="datetime-local" name="endTime" value={form.endTime} onChange={set}
         onBlur={() => markTouched('endTime')}
         className={`input ${errors.endTime && touched.endTime ? 'border-red-500/50' : ''}`}
        />
        <FieldHelp field="endTime" hint="Must be after the start time." />
       </div>
      </div>
     </div>
    </div>

    {/* Pricing & Category */}
    <div className="p-6 border-b border-surface-100">
     <div className="flex items-center gap-2 mb-1">
      <h3 className="text-sm font-semibold text-surface-700">Pricing & Category</h3>
      <span className="text-xs text-surface-400">— optional but helps with discoverability</span>
     </div>
     <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="form-label">
         <Users size={13} /> Capacity <span className="text-red-400">*</span>
        </label>
        <input
         type="number" name="capacity" value={form.capacity} onChange={set}
         onBlur={() => markTouched('capacity')}
         min="1" className={`input ${errors.capacity && touched.capacity ? 'border-red-500/50' : ''}`}
         placeholder="e.g. 200"
        />
        <FieldHelp field="capacity" hint="Max attendees. Use 50 for workshops, 500+ for conferences." />
       </div>
       <div>
        <label className="form-label">
         <DollarSign size={13} /> Ticket price (USD)
        </label>
        <input
         type="number" name="priceCents" value={form.priceCents} onChange={set}
         onBlur={() => markTouched('priceCents')}
         min="0" step="0.01" className={`input ${errors.priceCents && touched.priceCents ? 'border-red-500/50' : ''}`}
         placeholder="0.00 = free event"
        />
        <FieldHelp field="priceCents" hint="Enter 0 or leave blank for free events. E.g. 29.99 for a $29.99 ticket." />
       </div>
      </div>
      <div>
       <label className="form-label">
        <Tag size={13} /> Category
       </label>
       <select
        name="category" value={form.category} onChange={set}
        onBlur={() => markTouched('category')}
        className="input select"
       >
        <option value="">— Choose a category —</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
       </select>
       <FieldHelp field="category" hint="Helps attendees find your event. E.g. Workshop for hands-on sessions." />
      </div>
     </div>
    </div>

    {/* Media */}
    <div className="p-6">
     <div className="flex items-center gap-2 mb-1">
      <h3 className="text-sm font-semibold text-surface-700">Cover Image</h3>
      <span className="text-xs text-surface-400">— optional, makes your event stand out</span>
     </div>
     <div className="mt-4">
      <label className="form-label">
       <Image size={13} /> Image URL
      </label>
      <input
       type="url" name="imageUrl" value={form.imageUrl} onChange={set}
       onBlur={() => markTouched('imageUrl')}
       className={`input ${errors.imageUrl && touched.imageUrl ? 'border-red-500/50' : ''}`}
       placeholder="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
      />
      <FieldHelp field="imageUrl" hint="Paste a URL to a photo. Use Unsplash or any image hosting service." />
     </div>
    </div>

    {/* Summary preview */}
    {form.title && (
     <div className="mx-6 mb-4 p-4 rounded-xl bg-surface-50/50 border border-surface-100">
      <p className="text-xs font-medium text-surface-500 mb-2 flex items-center gap-1.5">
       <CheckCircle size={12} /> Preview summary
      </p>
      <p className="text-sm font-semibold text-surface-800">{form.title}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-surface-500">
       {form.city && <span>📍 {form.city}</span>}
       {form.startTime && <span>📅 {new Date(form.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
       {form.capacity && <span>👥 {parseInt(form.capacity).toLocaleString()} seats</span>}
       {form.priceCents ? <span>💰 ${parseFloat(form.priceCents).toFixed(2)}</span> : form.priceCents === '0' ? <span className="text-emerald-500">🆓 Free</span> : null}
       {form.category && <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{form.category}</span>}
      </div>
     </div>
    )}

    {/* Actions */}
    <div className="px-6 py-4 border-t border-surface-100 flex gap-3">
     <button type="submit" disabled={loading} className="btn-primary flex-1 h-11">
      {loading ? (
       <span className="flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Creating…
       </span>
      ) : 'Create event'}
     </button>
     <button type="button" onClick={() => navigate(-1)} className="btn-secondary h-11">Cancel</button>
    </div>
   </form>

   {/* Tips card */}
   <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10">
    <p className="text-xs font-semibold text-brand-400 mb-2">💡 Example event to try</p>
    <p className="text-xs text-surface-500 leading-relaxed">
     <strong>Title:</strong> AI & Machine Learning Workshop<br />
     <strong>Venue:</strong> TechHub Innovation Center &nbsp;|&nbsp; <strong>City:</strong> Singapore<br />
     <strong>Date:</strong> Pick a future Saturday, 10:00 AM – 5:00 PM<br />
     <strong>Capacity:</strong> 50 &nbsp;|&nbsp; <strong>Price:</strong> 49.99 &nbsp;|&nbsp; <strong>Category:</strong> Workshop
    </p>
   </div>
  </div>
 );
}
