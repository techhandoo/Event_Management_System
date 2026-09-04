import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth, homeForRole } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
 const { login } = useAuth();
 const navigate = useNavigate();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

 const onSubmit = async (data: LoginForm) => {
  setIsSubmitting(true);
  try { const u = await login(data.email, data.password); toast.success('Welcome back!'); navigate(homeForRole(u?.role)); }
  catch (err: any) { toast.error(err.response?.data?.message || 'Invalid credentials'); }
  finally { setIsSubmitting(false); }
 };

 return (
  <div className="min-h-screen bg-surface-0 flex">
   {/* Form side */}
   <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    className="flex-1 flex items-center justify-center p-6 sm:p-8"
   >
    <div className="w-full max-w-md">
     <div className="mb-10">
      <Link to="/" className="inline-flex items-center gap-3 mb-10">
       <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl flex items-center justify-center ">
        <Zap className="text-white" size={20} />
       </div>
       <span className="text-xl font-bold text-surface-900 tracking-tight">Eventry</span>
      </Link>
      <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Welcome back</h1>
      <p className="text-surface-400 mt-2 text-sm">Sign in to your account to continue</p>
     </div>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
       <div className="flex items-center justify-between">
        <label className="label">Password</label>
        <Link to="/forgot-password" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
         Forgot password?
        </Link>
       </div>
       <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input
         type="password"
         {...register('password', { required: 'Password is required' })}
         className={`input pl-11 ${errors.password ? 'input-error' : ''}`}
         placeholder="Enter your password"
        />
       </div>
       {errors.password && <p className="form-message">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12 text-base">
       {isSubmitting ? 'Signing in...' : 'Sign in'}
       {!isSubmitting && <ArrowRight size={18} />}
      </button>
     </form>

     <p className="text-center mt-8 text-sm text-surface-400">
      Don't have an account?{' '}
      <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Create one</Link>
     </p>
    </div>
   </motion.div>

   {/* Brand panel */}
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-950 via-violet-950 to-surface-0 items-center justify-center p-12 relative overflow-hidden"
   >
    <div className="absolute inset-0">
     <div className="absolute top-20 right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
     <div className="absolute bottom-20 left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-[80px]" />
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
    </div>
    <div className="relative z-10 text-center max-w-md">
     <div className="w-16 h-16 bg-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/[0.1] ">
      <Zap className="text-white" size={28} />
     </div>
     <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Eventry</h2>
     <p className="text-surface-300 text-lg leading-relaxed">
      The modern event management platform. Create, discover, and book events with ease.
     </p>
    </div>
   </motion.div>
  </div>
 );
}
