import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Eye, EyeOff, ArrowLeft, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Name
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [savingName, setSavingName] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Password validation
  const passwordValid = newPassword.length >= 8;
  const passwordMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSavingName(true);
    try {
      await api.put('/users/me', { fullName: fullName.trim() });
      // Update local storage
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        u.fullName = fullName.trim();
        localStorage.setItem('user', JSON.stringify(u));
      }
      toast.success('Name updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) { toast.error('Enter a new email'); return; }
    if (!emailPassword) { toast.error('Enter your current password'); return; }
    setSavingEmail(true);
    try {
      await api.put('/users/me/email', { newEmail: newEmail.trim(), password: emailPassword });
      toast.success('Email updated! Please log in with your new email.');
      setNewEmail('');
      setEmailPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) { toast.error('Enter your current password'); return; }
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-600 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-violet-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Profile Settings</h1>
          <p className="text-surface-400 text-sm mt-0.5">Manage your account details</p>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2"><Shield size={16} /> Account Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-surface-400 text-xs uppercase tracking-wider font-semibold mb-1">Role</p>
            <p className="text-surface-700 font-medium">{user?.role}</p>
          </div>
          <div>
            <p className="text-surface-400 text-xs uppercase tracking-wider font-semibold mb-1">Status</p>
            <p className="text-emerald-500 font-medium">Active</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-surface-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Calendar size={12} /> Member since</p>
            <p className="text-surface-700 font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>
      </motion.div>

      {/* Change Name */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2"><User size={16} /> Full Name</h2>
        <form onSubmit={handleName} className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input w-full"
              placeholder="Your full name"
              minLength={2}
              maxLength={100}
            />
          </div>
          <button type="submit" disabled={savingName || fullName === user?.fullName} className="btn-primary h-11 flex items-center gap-2 disabled:opacity-40">
            <Save size={16} /> {savingName ? 'Saving...' : 'Save'}
          </button>
        </form>
      </motion.div>

      {/* Change Email */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-1 flex items-center gap-2"><Mail size={16} /> Email Address</h2>
        <p className="text-xs text-surface-400 mb-4">Current: <span className="text-surface-600">{user?.email}</span></p>
        <form onSubmit={handleEmail} className="space-y-3">
          <div>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="input w-full"
              placeholder="New email address"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showEmailPassword ? 'text' : 'password'}
              value={emailPassword}
              onChange={e => setEmailPassword(e.target.value)}
              className="input w-full pr-10"
              placeholder="Current password (to confirm)"
              required
            />
            <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showEmailPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={savingEmail || !newEmail || !emailPassword} className="btn-primary h-11 flex items-center gap-2 disabled:opacity-40">
            <Save size={16} /> {savingEmail ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2"><Lock size={16} /> Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-3">
          <div className="relative">
            <input
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="input w-full pr-10"
              placeholder="Current password"
              required
            />
            <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input w-full pr-10"
              placeholder="New password (min 8 characters)"
              minLength={8}
              required
            />
            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${passwordValid ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={passwordValid ? 'text-emerald-400' : 'text-red-400'}>
                {passwordValid ? 'Password length OK' : 'Minimum 8 characters'}
              </span>
            </div>
          )}
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input w-full"
              placeholder="Confirm new password"
              minLength={8}
              required
            />
          </div>
          {confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${passwordMatch ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={passwordMatch ? 'text-emerald-400' : 'text-red-400'}>
                {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
          <button type="submit" disabled={savingPassword || !currentPassword || !passwordValid || !passwordMatch} className="btn-primary h-11 flex items-center gap-2 disabled:opacity-40">
            <Lock size={16} /> {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
