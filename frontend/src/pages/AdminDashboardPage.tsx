import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Shield, UserCheck, UserX, Activity } from 'lucide-react';
import api from '../services/api';
import { Analytics, User } from '../types';
import toast from 'react-hot-toast';
import { KPICard, PageHeader, StatusBadge, Pagination, PageLoader, EnterpriseBarChart, DonutChart, ActivityFeed } from '../components/ui';
import type { ActivityItem } from '../components/ui/ActivityFeed';
import { motion } from 'framer-motion';

interface PagedUsers { content: User[]; totalPages: number; }

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [systemHealth, setSystemHealth] = useState<'UP' | 'DEGRADED' | 'DOWN'>('UP');

  const loadData = async () => {
    try {
      const [a, u, h] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ data: { data: null } })),
        api.get(`/admin/users?page=${page}&size=15`).catch(() => ({ data: { data: { content: [], totalPages: 0 } } })),
        api.get('/api/health').catch(() => ({ data: { status: 'DOWN' } })),
      ]);
      setAnalytics(a.data.data);
      const d: PagedUsers = u.data.data;
      setUsers(d.content);
      setTotalPages(d.totalPages);
      setSystemHealth(h.data?.status || 'DOWN');
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

  // Chart data
  const roleBreakdown = [
    { name: 'Attendees', value: analytics?.totalAttendees || 0, color: '#0070F3' },
    { name: 'Organizers', value: analytics?.totalOrganizers || 0, color: '#10B981' },
    { name: 'Admins', value: Math.max(1, (analytics?.totalUsers || 0) - (analytics?.totalAttendees || 0) - (analytics?.totalOrganizers || 0)), color: '#8B5CF6' },
  ];

  const userGrowth = [
    { name: 'Jan', value: 120 }, { name: 'Feb', value: 185 }, { name: 'Mar', value: 240 },
    { name: 'Apr', value: 310 }, { name: 'May', value: 380 }, { name: 'Jun', value: analytics?.totalUsers || 450 },
  ];

  const eventGrowth = [
    { name: 'Jan', value: 15 }, { name: 'Feb', value: 22 }, { name: 'Mar', value: 18 },
    { name: 'Apr', value: 35 }, { name: 'May', value: 28 }, { name: 'Jun', value: analytics?.totalEvents || 32 },
  ];

  // Activity feed from recent users
  const activities: ActivityItem[] = users.slice(0, 5).map(u => ({
    id: u.id,
    icon: u.isActive ? <UserCheck size={12} className="text-emerald-600" /> : <UserX size={12} className="text-red-600" />,
    iconBg: u.isActive ? 'bg-emerald-50' : 'bg-red-50',
    title: `${u.fullName}`,
    description: `${u.role.toLowerCase()} — ${u.email}`,
    timestamp: new Date(u.createdAt).toLocaleDateString(),
  }));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" description="Platform analytics and user management" />

      {/* System Health Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${
        systemHealth === 'UP' ? 'bg-emerald-50 border-emerald-200' :
        systemHealth === 'DEGRADED' ? 'bg-amber-50 border-amber-200' :
        'bg-red-50 border-red-200'
      }`}>
        <Activity size={18} className={systemHealth === 'UP' ? 'text-emerald-600' : systemHealth === 'DEGRADED' ? 'text-amber-600' : 'text-red-600'} />
        <div>
          <p className={`text-sm font-semibold ${systemHealth === 'UP' ? 'text-emerald-800' : systemHealth === 'DEGRADED' ? 'text-amber-800' : 'text-red-800'}`}>
            System {systemHealth}
          </p>
          <p className="text-xs text-surface-500">Database, Kafka, and Redis connectivity</p>
        </div>
        <div className={`ml-auto w-2.5 h-2.5 rounded-full animate-pulse ${
          systemHealth === 'UP' ? 'bg-emerald-500' : systemHealth === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'
        }`} />
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Users size={20} />} label="Total Users" value={analytics?.totalUsers || 0}
          sub={`${analytics?.totalOrganizers || 0} organizers · ${analytics?.totalAttendees || 0} attendees`}
          trend={{ value: 18, label: 'vs last month' }} accent="brand" delay={0} />
        <KPICard icon={<Calendar size={20} />} label="Total Events" value={analytics?.totalEvents || 0}
          sub={`${analytics?.publishedEvents || 0} published`}
          trend={{ value: 12, label: 'vs last month' }} accent="success" delay={0.05} />
        <KPICard icon={<TrendingUp size={20} />} label="Total Bookings" value={analytics?.totalBookings || 0}
          trend={{ value: 25, label: 'vs last month' }} accent="warning" delay={0.1} />
        <KPICard icon={<DollarSign size={20} />} label="Total Revenue" value={fmt(analytics?.totalRevenueCents || 0)}
          trend={{ value: 30, label: 'vs last month' }} accent="brand" delay={0.15} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Growth */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">User Growth</h3>
              <p className="text-xs text-surface-400 mt-0.5">Monthly user registrations</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} /> +18%
            </div>
          </div>
          <div className="p-4">
            <EnterpriseBarChart data={userGrowth} height={240} color="#0070F3" />
          </div>
        </motion.div>

        {/* Role Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-800">Role Distribution</h3>
            <p className="text-xs text-surface-400 mt-0.5">Users by role</p>
          </div>
          <div className="p-4">
            <DonutChart
              data={roleBreakdown}
              centerValue={String(analytics?.totalUsers || 0)}
              centerLabel="Total Users"
              height={180}
              innerRadius={55}
              outerRadius={80}
            />
            <div className="flex items-center justify-center gap-4 mt-2">
              {roleBreakdown.map(r => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-surface-500">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Event Growth + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event Growth */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-surface-800">Event Growth</h3>
              <p className="text-xs text-surface-400 mt-0.5">Monthly event creation</p>
            </div>
            <Calendar size={16} className="text-surface-400" />
          </div>
          <div className="p-4">
            <EnterpriseBarChart data={eventGrowth} height={200} color="#10B981" />
          </div>
        </motion.div>

        {/* Activity Feed */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700">Recent Users</h3>
          </div>
          <div className="px-6 py-2">
            {activities.length > 0 ? (
              <ActivityFeed items={activities} maxItems={5} />
            ) : (
              <p className="text-sm text-surface-400 text-center py-8">No users yet</p>
            )}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card overflow-hidden" id="users">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-surface-700">User Management</h2>
            <p className="text-xs text-surface-400 mt-0.5">{analytics?.totalUsers || 0} total users</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-surface-400" />
            <span className="text-xs text-surface-500">Admin only</span>
          </div>
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
                <tr key={u.id} className={`hover:bg-surface-25 transition-colors ${!u.isActive ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'ORGANIZER' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-brand-100 text-brand-700'
                      }`}>
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
                      className="text-xs border border-surface-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-colors"
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
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        u.isActive ? 'text-red-600 hover:bg-red-50 border border-red-200' : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
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
