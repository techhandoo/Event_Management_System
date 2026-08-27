import { useState, useEffect, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { authApi } from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }
    authApi
      .validateResetToken(token)
      .then((res) => {
        setTokenValid(res.data.data.valid);
        setEmail(res.data.data.email);
      })
      .catch(() => {
        setTokenValid(false);
      })
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state — validating token
  if (validating) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-surface-500">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Invalid or expired link</h2>
          <p className="text-surface-500 text-sm mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary justify-center">
            Request new reset link
          </Link>
        </motion.div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Password updated</h2>
          <p className="text-surface-500 text-sm mb-8">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link to="/login" className="btn btn-primary justify-center w-full">
            Sign in to your account
          </Link>
        </motion.div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Eventry</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Almost there.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed max-w-md">
            Create a strong, unique password for <strong className="text-white">{email}</strong>.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-brand-100">
              <ShieldCheck className="w-4 h-4 text-brand-200" />
              <span className="text-sm">At least 6 characters</span>
            </div>
            <div className="flex items-center gap-3 text-brand-100">
              <ShieldCheck className="w-4 h-4 text-brand-200" />
              <span className="text-sm">Mix letters, numbers, and symbols</span>
            </div>
            <div className="flex items-center gap-3 text-brand-100">
              <ShieldCheck className="w-4 h-4 text-brand-200" />
              <span className="text-sm">Avoid common passwords</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900 tracking-tight">Eventry</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 mb-2">Create new password</h2>
          <p className="text-surface-500 text-sm mb-8">
            Enter your new password below. Make sure it's strong and unique.
          </p>

          <form onSubmit={handleSubmit} className="card p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="form-item">
              <label htmlFor="newPassword" className="label">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Enter new password"
                  required
                  autoFocus
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= i * 3
                            ? newPassword.length >= 12
                              ? 'bg-emerald-500'
                              : newPassword.length >= 8
                                ? 'bg-amber-500'
                                : 'bg-red-400'
                            : 'bg-surface-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-item">
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="btn btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Reset password'
              )}
            </button>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-brand-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
