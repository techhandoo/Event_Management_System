import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Users, Bell } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-50/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 border border-brand-200/60 rounded-full text-brand-700 text-xs font-semibold mb-8"
          >
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Now in beta — free for early adopters
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-800 tracking-tight leading-[1.08] mb-6"
          >
            Discover extraordinary{' '}
            <span className="bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">
              events
            </span>{' '}
            near you
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The modern event management platform. Create, manage, and book events
            with real-time notifications, smart scheduling, and seamless workflows.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn btn-primary h-12 px-8 text-base gap-2 shadow-brand">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/events" className="btn btn-secondary h-12 px-8 text-base">
              Browse events
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-surface-400"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1,000+ events created</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Real-time updates</span>
            </div>
          </motion.div>
        </div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-card-lg border border-surface-150 overflow-hidden">
            <div className="bg-surface-50 px-4 py-3 border-b border-surface-100 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="ml-4 flex-1 bg-white rounded-md h-6 px-3 flex items-center border border-surface-100">
                <span className="text-xs text-surface-400">eventry.app/events</span>
              </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-surface-25 to-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Tech Conference 2026', date: 'Mar 15', spots: '120 left', color: 'from-brand-500 to-brand-600' },
                  { title: 'Jazz Night Live', date: 'Mar 22', spots: '45 left', color: 'from-violet-500 to-purple-600' },
                  { title: 'Startup Pitch Day', date: 'Apr 1', spots: '80 left', color: 'from-emerald-500 to-teal-600' },
                ].map((event) => (
                  <div key={event.title} className="bg-white rounded-xl border border-surface-150 overflow-hidden hover:shadow-card-hover transition-shadow">
                    <div className={`h-20 bg-gradient-to-r ${event.color}`} />
                    <div className="p-4">
                      <h4 className="font-semibold text-surface-800 text-sm">{event.title}</h4>
                      <p className="text-xs text-surface-400 mt-1">{event.date}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{event.spots}</span>
                        <button className="text-xs font-semibold text-brand-600 hover:text-brand-700">Book</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
