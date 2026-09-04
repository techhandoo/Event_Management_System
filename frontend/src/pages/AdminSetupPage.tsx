import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Shield, Zap, ArrowRight, Key } from 'lucide-react';

interface SetupForm {
 seedKey: string;
 fullName: string;
 email: string;
 password: string;
}

export default function AdminSetupPage() {
 const navigate = useNavigate();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [success, setSuccess] = useState(false);
 const { register, handleSubmit, formState: { errors } } = useForm<SetupForm>();

 const onSubmit = async (data: SetupForm) => {
  setIsSubmitting(true);
  try {
   const response = await api.post('/auth/seed-admin', data);
   const { accessToken, refreshToken, user } = response.data.data;
   localStorage.setItem('accessToken', accessToken);
   localStorage.setItem('refreshToken', refreshToken);
   localStorage.setItem('user', JSON.stringify(user));
   setSuccess(true);
   toast.success('Admin account created!');
   setTimeout(() => navigate('/admin'), 1500); // Admin always goes to /admin
  } catch (err: any) {
   toast.error(err.response?.data?.message || 'Failed to create admin');
  } finally {
   setIsSubmitting(false);
  }
 };

 if (success) {
  return (
   <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
    <motion.div
     initial={{ scale: 0.9, opacity: 0 }}
     animate={{ scale: 1, opacity: 1 }}
     className="surface-card p-8 text-center max-w-md w-full"
    >
     <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
      <Shield className="text-emerald-400" size={32} />
     </div>
     <h2 className="text-2xl font-bold text-surface-900 mb-2">Admin Created!</h2>
     <p className="text-surface-400">Redirecting to admin panel...</p>
    </motion.div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-surface-50 flex">
   {/* Brand panel */}
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 via-brand-700 to-brand-800 items-center justify-center p-12 relative overflow-hidden order-first"
   >
    <div className="absolute inset-0 opacity-10">
     <div className="absolute top-20 right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
     <div className="absolute bottom-20 left-20 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
    </div>
    <div className="relative z-10 text-center max-w-md">
     <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <Shield className="text-white" size={28} />
     </div>      <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Admin Setup</h1>
     <p className="text-violet-200 text-lg leading-relaxed">
      Create the first administrator account. This is a one-time operation that can only be performed once.
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
       <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
        <Zap className="text-white" size={18} />
       </div>
       <span className="text-xl font-bold text-surface-900 tracking-tight">Eventry</span>
      </Link>
      <h1 className="text-2xl font-bold text-surface-900">Create Admin Account</h1>
      <p className="text-surface-400 mt-1 text-sm">One-time setup — this page disables after use</p>
     </div>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-item">
       <label className="label">Secret Key</label>
       <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input
         type="password"
         {...register('seedKey', { required: 'Secret key is required' })}
         className={`input pl-10 ${errors.seedKey ? 'input-error' : ''}`}
         placeholder="Enter the admin seed key"
        />
       </div>
       {errors.seedKey && <p className="form-message">{errors.seedKey.message}</p>}
       <p className="text-[11px] text-surface-400 mt-1">Set via ADMIN_SEED_KEY environment variable</p>
      </div>

      <div className="form-item">
       <label className="label">Full Name</label>
       <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input
         type="text"
         {...register('fullName', { required: 'Full name is required' })}
         className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
         placeholder="Admin User"
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
         placeholder="admin@eventry.app"
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
         {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
         className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
         placeholder="Create a strong password"
        />
       </div>
       {errors.password && <p className="form-message">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
       {isSubmitting ? 'Creating admin...' : 'Create Admin Account'}
       {!isSubmitting && <ArrowRight size={16} />}
      </button>
     </form>

     <p className="text-center mt-6 text-sm text-surface-500">
      <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">← Back to Login</Link>
     </p>
    </div>
   </motion.div>
  </div>
 );
}
