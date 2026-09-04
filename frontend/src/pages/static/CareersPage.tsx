import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Code, Palette, Megaphone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const openings = [
 {
  title: 'Senior Backend Engineer',
  department: 'Engineering',
  location: 'Remote',
  type: 'Full-time',
  icon: <Code className="w-5 h-5" />,
  description: 'Build and scale our Spring Boot + Kafka backend infrastructure. You\'ll work on real-time event streaming, database optimization, and API design.',
  tags: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'],
 },
 {
  title: 'Product Designer',
  department: 'Design',
  location: 'Remote',
  type: 'Full-time',
  icon: <Palette className="w-5 h-5" />,
  description: 'Shape the visual identity of Eventry. Design intuitive interfaces that make complex event management feel simple and delightful.',
  tags: ['Figma', 'React', 'Tailwind CSS', 'Motion Design'],
 },
 {
  title: 'Growth Marketing Lead',
  department: 'Marketing',
  location: 'Hybrid',
  type: 'Full-time',
  icon: <Megaphone className="w-5 h-5" />,
  description: 'Drive Eventry\'s growth from 0 to 1. Build our brand presence, run campaigns, and establish partnerships with event organizers worldwide.',
  tags: ['SEO', 'Content', 'Partnerships', 'Analytics'],
 },
];

const benefits = [
 '🏥 Health & dental insurance',
 '🏠 Remote-first culture',
 '📚 Learning & development budget',
 '🌴 Unlimited PTO',
 '💰 Competitive equity package',
 '🎉 Team retreats & events',
 '🖥️ Latest equipment',
 '📈 Growth opportunities',
];

const stagger = {
 hidden: {},
 show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CareersPage() {
 return (
  <StaticPageLayout>
   <div className="text-center mb-16">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">Careers</motion.span>
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
    >
     Join the <span className="gradient-text">Eventry</span> team
    </motion.h1>
    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-surface-400 max-w-xl mx-auto">
     We're building the future of event management. Come help us create something extraordinary.
    </motion.p>
   </div>

   {/* Openings */}
   <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl font-bold text-white mb-6">
    Open Positions
   </motion.h2>
   <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4 mb-16">
    {openings.map((job) => (
     <motion.div
      key={job.title}
      variants={fadeUp}
      className="surface-card p-6 group hover:border-brand-500/20 transition-all duration-300 cursor-pointer"
      onClick={() => toast('Application portal coming soon', { icon: '💼' })}
     >
      <div className="flex items-start justify-between gap-4">
       <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
         <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400">
          {job.icon}
         </div>
         <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors">{job.title}</h3>
          <div className="flex items-center gap-2 text-xs text-surface-400">
           <span>{job.department}</span>
           <span>•</span>
           <span>{job.location}</span>
           <span>•</span>
           <span>{job.type}</span>
          </div>
         </div>
        </div>
        <p className="text-sm text-surface-400 leading-relaxed mb-3 ml-[52px]">{job.description}</p>
        <div className="flex flex-wrap gap-2 ml-[52px]">
         {job.tags.map((tag) => (
          <span key={tag} className="badge bg-white/[0.06] text-surface-400 border-white/[0.08] text-[10px]">
           {tag}
          </span>
         ))}
        </div>
       </div>
       <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
      </div>
     </motion.div>
    ))}
   </motion.div>

   {/* Benefits */}
   <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl font-bold text-white mb-6">
    Benefits & Perks
   </motion.h2>
   <motion.div
    variants={stagger}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
   >
    {benefits.map((b) => (
     <motion.div key={b} variants={fadeUp} className="surface-card p-4 flex items-center gap-3">
      <span className="text-lg">{b.split(' ')[0]}</span>
      <span className="text-sm text-surface-400">{b.split(' ').slice(1).join(' ')}</span>
     </motion.div>
    ))}
   </motion.div>
  </StaticPageLayout>
 );
}
