import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Users, Bell, Sparkles, TrendingUp } from 'lucide-react';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-surface-0 to-surface-0" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-400/40 rounded-full"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-semibold mb-8 hover:bg-brand-500/15 transition-colors cursor-default"
          >
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Now in beta — free for early adopters
            <Sparkles size={12} className="text-brand-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.08)}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 tracking-tight leading-[1.08] mb-6"
          >
            Discover extraordinary{' '}
            <span className="gradient-text">
              events
            </span>{' '}
            near you
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.16)}
            className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The modern event management platform. Create, manage, and book events
            with real-time notifications, smart scheduling, and seamless workflows.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.24)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn btn-primary h-12 px-8 text-base gap-2">
              Get started free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/events" className="btn btn-secondary h-12 px-8 text-base">
              Browse events
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            {...fadeUp(0.4)}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-surface-400"
          >
            <div className="flex items-center gap-2 hover:text-surface-500 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 hover:text-surface-500 transition-colors">
              <Users className="w-4 h-4" />
              <span>1,000+ events created</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 hover:text-surface-500 transition-colors">
              <Bell className="w-4 h-4" />
              <span>Real-time updates</span>
            </div>
          </motion.div>
        </div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="glass-card overflow-hidden">
            <div className="bg-surface-50/50 px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80 hover:bg-red-400 transition-colors cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80 hover:bg-amber-400 transition-colors cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80 hover:bg-emerald-400 transition-colors cursor-pointer" />
              </div>
              <div className="ml-4 flex-1 bg-white/[0.04] rounded-md h-6 px-3 flex items-center border border-white/[0.06]">
                <span className="text-xs text-surface-400">eventry.app/events</span>
              </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-surface-25 to-surface-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Tech Conference 2026', date: 'Mar 15', spots: '120 left', color: 'from-brand-500 to-brand-600', icon: TrendingUp },
                  { title: 'Jazz Night Live', date: 'Mar 22', spots: '45 left', color: 'from-violet-500 to-purple-600', icon: Sparkles },
                  { title: 'Startup Pitch Day', date: 'Apr 1', spots: '80 left', color: 'from-emerald-500 to-teal-600', icon: Calendar },
                ].map((event, i) => (
                  <motion.div
                    key={event.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    className="card-hover overflow-hidden cursor-pointer group"
                  >
                    <div className={`h-20 bg-gradient-to-r ${event.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <event.icon className="absolute bottom-2 right-2 text-white/30 group-hover:text-white/50 transition-colors" size={24} />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-surface-800 text-sm group-hover:text-brand-400 transition-colors">{event.title}</h4>
                      <p className="text-xs text-surface-400 mt-1">{event.date}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{event.spots}</span>
                        <button className="text-xs font-semibold text-brand-400 hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-all duration-200">Book →</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
