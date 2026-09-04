import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Lock, Unlock } from 'lucide-react';

const endpoints = [
 {
  method: 'POST',
  path: '/api/auth/register',
  desc: 'Register a new user account',
  auth: false,
  body: '{ "email", "password", "fullName" }',
 },
 {
  method: 'POST',
  path: '/api/auth/login',
  desc: 'Authenticate and receive JWT tokens',
  auth: false,
  body: '{ "email", "password" }',
 },
 {
  method: 'GET',
  path: '/api/events',
  desc: 'List published events with optional city/category filters',
  auth: false,
  body: '?city=...&category=...&page=0&size=10',
 },
 {
  method: 'GET',
  path: '/api/events/{id}',
  desc: 'Get event details by ID',
  auth: false,
 },
 {
  method: 'GET',
  path: '/api/events/search',
  desc: 'Full-text search across events',
  auth: false,
  body: '?q=keyword&page=0&size=10',
 },
 {
  method: 'POST',
  path: '/api/events',
  desc: 'Create a new event (organizer/admin)',
  auth: true,
  body: '{ "title", "venue", "city", "startTime", "endTime", "capacity", ... }',
 },
 {
  method: 'PUT',
  path: '/api/events/{id}',
  desc: 'Update an existing event',
  auth: true,
 },
 {
  method: 'DELETE',
  path: '/api/events/{id}',
  desc: 'Cancel an event',
  auth: true,
 },
 {
  method: 'GET',
  path: '/api/events/my',
  desc: 'List events created by the authenticated organizer',
  auth: true,
 },
 {
  method: 'GET',
  path: '/api/events/my/stats',
  desc: 'Get organizer statistics (events, revenue)',
  auth: true,
 },
 {
  method: 'POST',
  path: '/api/bookings',
  desc: 'Book tickets for an event',
  auth: true,
  body: '{ "eventId", "quantity" }',
 },
 {
  method: 'GET',
  path: '/api/bookings/my',
  desc: 'List the authenticated user\'s bookings',
  auth: true,
 },
 {
  method: 'GET',
  path: '/api/notifications',
  desc: 'List notifications for the authenticated user',
  auth: true,
 },
 {
  method: 'GET',
  path: '/api/notifications/unread-count',
  desc: 'Get count of unread notifications',
  auth: true,
 },
 {
  method: 'GET',
  path: '/api/admin/analytics',
  desc: 'Platform-wide analytics (admin only)',
  auth: true,
 },
 {
  method: 'GET',
  path: '/api/admin/users',
  desc: 'List all users (admin only)',
  auth: true,
 },
];

const methodColors: Record<string, string> = {
 GET: 'bg-emerald-500/20 text-emerald-400',
 POST: 'bg-blue-500/20 text-blue-400',
 PUT: 'bg-amber-500/20 text-amber-400',
 DELETE: 'bg-red-500/20 text-red-400',
};

const fadeUp = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
 hidden: {},
 show: { transition: { staggerChildren: 0.04 } },
};

export default function ApiDocsPage() {
 return (
  <StaticPageLayout>
   <div className="mb-12">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">Developer</motion.span>
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="text-4xl font-extrabold text-white mb-4"
    >
     API <span className="gradient-text">Documentation</span>
    </motion.h1>
    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-surface-400 max-w-2xl leading-relaxed">
     Eventry exposes a RESTful API for all platform operations. All endpoints return JSON and use standard HTTP status codes. Authenticate via Bearer tokens.
    </motion.p>
   </div>

   {/* Auth info */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="surface-card p-6 mb-8"
   >
    <h2 className="text-lg font-semibold text-white mb-3">Authentication</h2>
    <p className="text-sm text-surface-400 leading-relaxed mb-3">
     Include your JWT access token in the <code className="text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">Authorization</code> header for protected endpoints:
    </p>
    <div className="bg-white/[0.03] rounded-xl p-4 font-mono text-sm text-surface-400 border border-white/[0.06]">
     <span className="text-emerald-400">Authorization</span>: Bearer &lt;your-access-token&gt;
    </div>
   </motion.div>

   {/* Base URL */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    className="surface-card p-6 mb-8"
   >
    <h2 className="text-sm font-semibold text-surface-500 mb-2">Base URL</h2>
    <div className="bg-white/[0.03] rounded-xl p-4 font-mono text-sm text-brand-400 border border-white/[0.06]">
     https://eventry-api.onrender.com/api
    </div>
   </motion.div>

   {/* Endpoints */}
   <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl font-bold text-white mb-4">
    Endpoints
   </motion.h2>

   <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
    {endpoints.map((ep, i) => (
     <motion.div
      key={`${ep.method}-${ep.path}-${i}`}
      variants={fadeUp}
      className="surface-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 group hover:border-brand-500/15 transition-all"
     >
      <div className="flex items-center gap-3 flex-shrink-0">
       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${methodColors[ep.method]}`}>
        {ep.method}
       </span>
       {ep.auth ? (
        <Lock size={12} className="text-amber-400" aria-label="Auth required" />
       ) : (
        <Unlock size={12} className="text-surface-400" aria-label="Public" />
       )}
      </div>
      <code className="text-sm text-surface-800 font-mono flex-shrink-0">{ep.path}</code>
      <span className="text-sm text-surface-400 hidden sm:inline">—</span>
      <span className="text-sm text-surface-400 flex-1">{ep.desc}</span>
      {ep.body && (
       <code className="text-xs text-surface-400 bg-white/[0.04] px-2 py-1 rounded-lg whitespace-nowrap overflow-x-auto max-w-[300px]">
        {ep.body}
       </code>
      )}
     </motion.div>
    ))}
   </motion.div>
  </StaticPageLayout>
 );
}
