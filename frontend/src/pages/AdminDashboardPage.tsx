import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { Analytics, User } from '../types';
import toast from 'react-hot-toast';
import { StatCard, PageHeader, StatusBadge, Pagination, PageLoader } from '../components/ui';

interface PagedUsers { content: User[]; totalPages: number; }

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = async () => {
    try {
      const [a, u] = await Promise.all([api.get('/admin/analytics'), api.get(`/admin/users?page=${page}&size=15`)]);
      setAnalytics(a.data.data);
      const d: PagedUsers = u.data.data;
      setUsers(d.content);
      setTotalPages(d.totalPages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [page]);

  const handleRole = async (id: number, role: string) => {
    try { await api.put(`/admin/users/${id}/role?role=${role}`); toast.success('Role updated'); loadData(); }
    catch { toast.error('Failed'); }
  };
  const handleBan = async (id: number) => {
    try { await api.put(`/admin/users/${id}/ban`); toast.success('Status toggled'); loadData(); }
    catch { toast.error('Failed'); }
  };
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" description="Platform analytics and user management" />

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users size={20} />} label="Total Users" value={analytics.totalUsers} sub={`${analytics.totalOrganizers} orgs · ${analytics.totalAttendees} att.`} accent="brand" delay={0} />
          <StatCard icon={<Calendar size={20} />} label="Events" value={analytics.totalEvents} sub={`${analytics.publishedEvents} published`} accent="success" delay={0.05} />
          <StatCard icon={<TrendingUp size={20} />} label="Bookings" value={analytics.totalBookings} accent="warning" delay={0.1} />
          <StatCard icon={<DollarSign size={20} />} label="Revenue" value={fmt(analytics.totalRevenueCents)} accent="brand" delay={0.15} />
        </div>
      )}

      <div className="card overflow-hidden" id="users">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-sm font-semibold text-surface-700">User management</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6">User</th>
                <th className="px-6">Role</th>
                <th className="px-6">Status</th>
                <th className="px-6 hidden sm:table-cell">Joined</th>
                <th className="px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={!u.isActive ? 'bg-red-50/30' : ''}>
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center text-xs font-bold text-surface-600 flex-shrink-0">
                        {u.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-800 truncate">{u.fullName}</p>
                        <p className="text-xs text-surface-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6">
                    <select
                      value={u.role}
                      onChange={e => handleRole(u.id, e.target.value)}
                      className="text-xs border border-surface-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                    >
                      <option value="ATTENDEE">Attendee</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6"><StatusBadge status={u.isActive ? 'ACTIVE' : 'BANNED'} /></td>
                  <td className="px-6 text-xs text-surface-500 hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 text-right">
                    <button
                      onClick={() => handleBan(u.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'Ban' : 'Unban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
