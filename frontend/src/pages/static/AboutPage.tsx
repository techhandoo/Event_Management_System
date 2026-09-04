import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Target, Users, Lightbulb, Globe } from 'lucide-react';

const values = [
 {
  icon: <Target className="w-6 h-6" />,
  title: 'Mission-Driven',
  description: 'We believe event management should be effortless. Our platform removes friction so organizers can focus on what matters — creating memorable experiences.',
 },
 {
  icon: <Users className="w-6 h-6" />,
  title: 'Community First',
  description: 'Built for the event community. Every feature is designed with real organizers and attendees in mind, from small meetups to large-scale conferences.',
 },
 {
  icon: <Lightbulb className="w-6 h-6" />,
  title: 'Innovation',
  description: 'Leveraging modern tech — real-time notifications via Kafka, intelligent caching, and a React-powered UI — to deliver a world-class experience.',
 },
 {
  icon: <Globe className="w-6 h-6" />,
  title: 'Global Scale',
  description: 'From Singapore to San Francisco, Eventry is built to scale. Multi-city support, timezone handling, and a performant architecture.',
 },
];

const team = [
 { name: 'Engineering', role: 'Building the future of events', avatar: '⚙️' },
 { name: 'Design', role: 'Crafting beautiful experiences', avatar: '🎨' },
 { name: 'Community', role: 'Connecting event creators', avatar: '🤝' },
];

const stagger = {
 hidden: {},
 show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
 return (
  <StaticPageLayout>
   {/* Hero */}
   <div className="text-center mb-16">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
     <span className="badge-brand mb-4 inline-block">About Eventry</span>
    </motion.div>
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: 0.1, duration: 0.5 }}
     className="text-4xl sm:text-5xl font-extrabold text-white mb-6"
    >
     The modern platform for{' '}
     <span className="gradient-text">event creators</span>
    </motion.h1>
    <motion.p
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: 0.2, duration: 0.5 }}
     className="text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed"
    >
     Eventry was born from a simple frustration: managing events shouldn't require a degree in logistics.
     We're building the tools that let creators focus on their craft.
    </motion.p>
   </div>

   {/* Story */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.5 }}
    className="surface-card p-8 mb-16"
   >
    <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
    <div className="space-y-4 text-surface-400 leading-relaxed">
     <p>
      Eventry started as a side project in 2024, built by a team frustrated with the fragmented 
      landscape of event management tools. We noticed that organizers were stitching together 
      spreadsheets, email lists, and payment processors just to run a single event.
     </p>
     <p>
      Today, Eventry serves organizers across multiple cities, handling everything from ticket 
      sales and attendee management to real-time notifications and analytics — all in one 
      beautifully designed platform.
     </p>
     <p>
      We're backed by modern technology: Spring Boot for a robust backend, Apache Kafka for 
      real-time event streaming, PostgreSQL for reliable data storage, and React with Tailwind CSS 
      for an interface that's a joy to use.
     </p>
    </div>
   </motion.div>

   {/* Values */}
   <motion.h2
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="text-2xl font-bold text-white text-center mb-8"
   >
    Our Values
   </motion.h2>
   <motion.div
    variants={stagger}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16"
   >
    {values.map((v) => (
     <motion.div key={v.title} variants={fadeUp} className="surface-card p-6 group hover:border-brand-500/20 transition-all duration-300">
      <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
       {v.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
      <p className="text-sm text-surface-400 leading-relaxed">{v.description}</p>
     </motion.div>
    ))}
   </motion.div>

   {/* Team */}
   <motion.h2
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="text-2xl font-bold text-white text-center mb-8"
   >
    The Team
   </motion.h2>
   <motion.div
    variants={stagger}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-3 gap-6"
   >
    {team.map((t) => (
     <motion.div key={t.name} variants={fadeUp} className="surface-card p-6 text-center group hover:border-brand-500/20 transition-all duration-300">
      <div className="text-4xl mb-3">{t.avatar}</div>
      <h3 className="text-lg font-semibold text-white">{t.name}</h3>
      <p className="text-sm text-surface-400 mt-1">{t.role}</p>
     </motion.div>
    ))}
   </motion.div>
  </StaticPageLayout>
 );
}
