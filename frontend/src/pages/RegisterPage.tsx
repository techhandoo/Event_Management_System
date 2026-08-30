import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth, homeForRole } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap, ArrowRight, Users, Ticket } from 'lucide-react';
import { cn } from '../lib/utils';

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
      await reg(data.email, data.password, data.fullName, selectedRole);
      toast.success('Account created!');
      navigate(homeForRole(selectedRole));
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to register'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex">
      {/* Brand panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-950 via-violet-950 to-surface-0 items-center justify-center p-12 relative overflow-hidden order-first"
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-white/[0.08] backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/[0.1] shadow-glow">
            <Zap className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Join Eventry</h2>
          <p className="text-surface-300 text-lg leading-relaxed">
            Start creating and booking events in minutes. No credit card required.
          </p>
        </div>
      </motion.div>

      {/* Form side */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 flex items-center justify-center p-6 sm:p-8"
      >
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-10 lg:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl flex items-center justify-center shadow-glow">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">Eventry</span>
            </Link>
            <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Create your account</h1>
            <p className="text-surface-400 mt-2 text-sm">Fill in your details to get started</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all duration-200",
                  selectedRole === r.value
                    ? "border-brand-500/50 bg-brand-500/[0.08] shadow-glow"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.05]"
                )}
              >
                <r.icon size={18} className={selectedRole === r.value ? "text-brand-400" : "text-surface-400"} />
                <p className={cn("text-sm font-semibold mt-2", selectedRole === r.value ? "text-brand-300" : "text-surface-600")}>{r.label}</p>
                <p className="text-[11px] text-surface-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="form-item">
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className={`input pl-11 ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="form-message">{errors.fullName.message}</p>}
            </div>

            <div className="form-item">
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  className={`input pl-11 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="form-message">{errors.email.message}</p>}
            </div>

            <div className="form-item">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                  className={`input pl-11 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && <p className="form-message">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12 text-base">
              {isSubmitting ? 'Creating account...' : 'Create account'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
