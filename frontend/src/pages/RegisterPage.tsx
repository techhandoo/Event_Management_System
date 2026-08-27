import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap, ArrowRight, Users, Shield, Ticket } from 'lucide-react';

interface RegisterForm { fullName: string; email: string; password: string; }

const ROLES = [
  { value: 'ATTENDEE', label: 'Attendee', icon: Ticket, desc: 'Book and attend events' },
  { value: 'ORGANIZER', label: 'Organizer', icon: Users, desc: 'Create and manage events' },
] as const;

export default function RegisterPage() {
  const { register: reg } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('ATTENDEE');
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await reg(data.email, data.password, data.fullName);
      toast.success('Account created!');
      navigate('/events');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to register'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Brand panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 items-center justify-center p-12 relative overflow-hidden order-first"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Join Eventry</h2>
          <p className="text-brand-200 text-lg leading-relaxed">
            Start creating and booking events in minutes. No credit card required.
          </p>
        </div>
      </motion.div>

      {/* Form side */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-8"
      >
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
                <Zap className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-surface-800 tracking-tight">Eventry</span>
            </Link>
            <h1 className="text-2xl font-bold text-surface-800">Create your account</h1>
            <p className="text-surface-500 mt-1 text-sm">Fill in your details to get started</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedRole === r.value
                    ? 'border-brand-600 bg-brand-50 shadow-brand'
                    : 'border-surface-200 bg-white hover:border-surface-300'
                }`}
              >
                <r.icon size={18} className={selectedRole === r.value ? 'text-brand-600' : 'text-surface-400'} />
                <p className={`text-sm font-semibold mt-1.5 ${selectedRole === r.value ? 'text-brand-700' : 'text-surface-700'}`}>{r.label}</p>
                <p className="text-[11px] text-surface-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-item">
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="form-message">{errors.fullName.message}</p>}
            </div>

            <div className="form-item">
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="form-message">{errors.email.message}</p>}
            </div>

            <div className="form-item">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                  className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && <p className="form-message">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
              {isSubmitting ? 'Creating account...' : 'Create account'}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
