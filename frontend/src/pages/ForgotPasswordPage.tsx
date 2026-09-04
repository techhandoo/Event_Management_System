import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState('');
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
   await authApi.forgotPassword(email);
   setSuccess(true);
  } catch (err: unknown) {
   const apiErr = err as { response?: { data?: { message?: string } } };
   setError(apiErr.response?.data?.message || 'Something went wrong. Please try again.');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-surface-0 flex">
   {/* Brand panel */}
   <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
     <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
     <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
    </div>
    <div className="relative z-10 flex flex-col justify-center px-16 text-white">
     <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
       <KeyRound className="w-5 h-5" />
      </div>
      <span className="text-2xl font-bold tracking-tight">Eventry</span>
     </div>
     <h1 className="text-4xl font-bold leading-tight mb-4">
      Don't worry,<br />we've got you.
     </h1>
     <p className="text-brand-200 text-lg leading-relaxed max-w-md">
      Enter your email address and we'll send you a secure link to reset your password.
     </p>
    </div>
   </div>

   {/* Form */}
   <div className="flex-1 flex items-center justify-center px-6 py-12">
    <motion.div
     initial={{ opacity: 0, y: 12 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.4 }}
     className="w-full max-w-md"
    >
     <div className="lg:hidden flex items-center gap-2.5 mb-8">
      <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
       <KeyRound className="w-4 h-4 text-white" />
      </div>
      <span className="text-xl font-bold text-surface-900 tracking-tight">Eventry</span>
     </div>

     <h1 className="text-2xl font-bold text-surface-900 mb-2">Reset your password</h1>
     <p className="text-surface-400 text-sm mb-8">
      Enter the email address associated with your account and we'll send a reset link.
     </p>

     {success ? (
      <motion.div
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       className="card p-6 text-center"
      >
       <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
       </div>
       <h3 className="text-lg font-semibold text-surface-900 mb-2">Check your email</h3>
       <p className="text-sm text-surface-400 mb-6">
        We've sent a password reset link to <strong className="text-surface-800">{email}</strong>.
        The link expires in 1 hour.
       </p>
       <div className="space-y-2">
        <Link to="/login" className="btn btn-primary w-full justify-center h-10">Back to Sign in</Link>
        <button
         onClick={() => { setSuccess(false); setEmail(''); }}
         className="btn btn-ghost w-full justify-center text-sm"
        >
         Try a different email
        </button>
       </div>
      </motion.div>
     ) : (
      <form onSubmit={handleSubmit} className="card p-6">
       {error && (
        <motion.div
         initial={{ opacity: 0, height: 0 }}
         animate={{ opacity: 1, height: 'auto' }}
         className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4"
        >
         <AlertCircle className="w-4 h-4 flex-shrink-0" />
         {error}
        </motion.div>
       )}

       <div className="form-item">
        <label className="label">Email address</label>
        <div className="relative">
         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
         <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input pl-10"
          placeholder="you@example.com"
          required
          autoFocus
         />
        </div>
       </div>

       <button type="submit" disabled={loading || !email} className="btn-primary w-full h-10 mt-4">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
       </button>

       <div className="mt-6 text-center">
        <Link
         to="/login"
         className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-brand-600 transition-colors"
        >
         <ArrowLeft className="w-3.5 h-3.5" />
         Back to Sign in
        </Link>
       </div>
      </form>
     )}
    </motion.div>
   </div>
  </div>
 );
}
