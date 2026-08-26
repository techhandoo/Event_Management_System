import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Shield, Ban, CheckCircle, UserCheck } from 'lucide-react';
import api from '../services/api';
import { Analytics, User } from '../types';
import toast from 'react-hot-toast';

interface PagedUsers {
  content: User[];
  totalElements: number;
  totalPages: number;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get(`/admin/users?page=${page}&size=15`),
      ]);
      setAnalytics(analyticsRes.data.data);
      const userData: PagedUsers = usersRes.data.data;
      setUsers(userData.content);
      setTotalPages(userData.totalPages);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      toast.success('Role updated');
      loadData();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleBanToggle = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/ban`);
      toast.success('User status toggled');
      loadData();
    } catch {
      toast.error('Failed to toggle user status');
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard icon={<Users className="text-indigo-600" />} label="Total Users" value={analytics.totalUsers} sub={`${analytics.totalOrganizers} organizers · ${analytics.totalAttendees} attendees`} />
          <AnalyticsCard icon={<Calendar className="text-green-600" />} label="Total Events" value={analytics.totalEvents} sub={`${analytics.publishedEvents} published`} />
          <AnalyticsCard icon={<TrendingUp className="text-blue-600" />} label="Total Bookings" value={analytics.totalBookings} sub="across all events" />
          <AnalyticsCard icon={<DollarSign className="text-emerald-600" />} label="Total Revenue" value={formatCents(analytics.totalRevenueCents)} sub="lifetime revenue" />
        </div>
      )}

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${!user.isActive ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ATTENDEE">Attendee</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                        <Ban size={12} /> Banned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleBanToggle(user.id)}
                      className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-md transition ${
                        user.isActive
                          ? 'text-red-600 hover:bg-red-50 border border-red-200'
                          : 'text-green-600 hover:bg-green-50 border border-green-200'
                      }`}
                    >
                      {user.isActive ? <><Ban size={14} /> Ban</> : <><UserCheck size={14} /> Unban</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400">← Previous</button>
            <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}
