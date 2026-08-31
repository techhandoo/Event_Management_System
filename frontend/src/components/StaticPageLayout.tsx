import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import LandingHeader from './landing/LandingHeader';
import Footer from './landing/Footer';

export default function StaticPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <LandingHeader />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="pt-24 pb-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
