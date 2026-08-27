import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 rounded-2xl p-12 sm:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of organizers and attendees using Eventry to create and discover amazing events.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn bg-white text-brand-700 hover:bg-brand-50 h-12 px-8 text-base font-semibold gap-2 shadow-card-lg"
              >
                Create your first event
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/events"
                className="btn bg-white/10 text-white hover:bg-white/20 h-12 px-8 text-base backdrop-blur-sm"
              >
                Browse events
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
