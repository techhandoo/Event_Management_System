import { motion } from 'framer-motion';
import { CalendarPlus, Ticket, Bell, BarChart3, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: CalendarPlus,
    title: 'Create & Manage Events',
    description: 'Build events with rich details — venue, capacity, pricing, scheduling. Publish or keep drafts private.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: Ticket,
    title: 'Instant Bookings',
    description: 'Real-time availability tracking, instant confirmations, and capacity management for high-concurrency registration.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Event updates, booking confirmations, and reminders delivered in real-time via Kafka-powered messaging.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Organizer Analytics',
    description: 'Track bookings, revenue, and attendance. Get insights into your events with comprehensive dashboards.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'JWT authentication with Admin, Organizer, and Attendee roles. Fine-grained permissions for every action.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Redis caching, optimized indexes, and async Kafka processing for sub-second response times.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-800 mt-3 mb-4 tracking-tight">
            Everything you need to run events
          </h2>
          <p className="text-surface-500 text-lg max-w-2xl mx-auto">
            From creation to checkout, Eventry handles every step of the event lifecycle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="p-6 rounded-xl border border-surface-150 bg-white hover:shadow-card-hover hover:border-surface-200 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-surface-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
