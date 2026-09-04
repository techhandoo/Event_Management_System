import { motion } from 'framer-motion';
import { CalendarPlus, Ticket, Bell, BarChart3, Shield, Zap } from 'lucide-react';

const features = [
 {
  icon: CalendarPlus,
  title: 'Create & Manage Events',
  description: 'Build events with rich details — venue, capacity, pricing, scheduling. Publish or keep drafts private.',
  color: 'bg-brand-500/10 text-brand-400',
  hoverColor: 'group-hover:bg-brand-500/20',
 },
 {
  icon: Ticket,
  title: 'Instant Bookings',
  description: 'Real-time availability tracking, instant confirmations, and capacity management for high-concurrency registration.',
  color: 'bg-emerald-500/10 text-emerald-400',
  hoverColor: 'group-hover:bg-emerald-500/20',
 },
 {
  icon: Bell,
  title: 'Smart Notifications',
  description: 'Event updates, booking confirmations, and reminders delivered in real-time via Kafka-powered messaging.',
  color: 'bg-amber-500/10 text-amber-400',
  hoverColor: 'group-hover:bg-amber-500/20',
 },
 {
  icon: BarChart3,
  title: 'Organizer Analytics',
  description: 'Track bookings, revenue, and attendance. Get insights into your events with comprehensive dashboards.',
  color: 'bg-violet-500/10 text-violet-400',
  hoverColor: 'group-hover:bg-violet-500/20',
 },
 {
  icon: Shield,
  title: 'Role-Based Access',
  description: 'JWT authentication with Admin, Organizer, and Attendee roles. Fine-grained permissions for every action.',
  color: 'bg-red-500/10 text-red-400',
  hoverColor: 'group-hover:bg-red-500/20',
 },
 {
  icon: Zap,
  title: 'Blazing Fast',
  description: 'Redis caching, optimized indexes, and async Kafka processing for sub-second response times.',
  color: 'bg-cyan-500/10 text-cyan-400',
  hoverColor: 'group-hover:bg-cyan-500/20',
 },
];

export default function Features() {
 return (
  <section id="features" className="py-24 bg-surface-0">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
     initial={{ opacity: 0, y: 12 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: '-80px' }}
     transition={{ duration: 0.4 }}
     className="text-center mb-16"
    >
     <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Features</span>
     <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mt-3 mb-4 tracking-tight">
      Everything you need to run events
     </h2>
     <p className="text-surface-400 text-lg max-w-2xl mx-auto">
      From creation to checkout, Eventry handles every step of the event lifecycle.
     </p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
     {features.map((feature, index) => (
      <motion.div
       key={feature.title}
       initial={{ opacity: 0, y: 16 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: '-40px' }}
       transition={{ duration: 0.4, delay: index * 0.06 }}
       className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:shadow-card-hover hover:border-white/[0.1] transition-all duration-300 cursor-default"
      >
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.color} ${feature.hoverColor} transition-colors duration-200`}>
        <feature.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
       </div>
       <h3 className="text-[15px] font-semibold text-surface-800 mb-2 group-hover:text-brand-400 transition-colors">{feature.title}</h3>
       <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
      </motion.div>
     ))}
    </div>
   </div>
  </section>
 );
}
