import { motion } from 'framer-motion';
import { UserPlus, Search, CheckCircle2 } from 'lucide-react';

const steps = [
 {
  step: '01',
  icon: UserPlus,
  title: 'Create your account',
  description: 'Sign up in seconds with email and password. Choose your role — attendee, organizer, or admin.',
  color: 'from-brand-500 to-brand-600',
 },
 {
  step: '02',
  icon: Search,
  title: 'Discover or create events',
  description: 'Browse curated events or create your own with rich details, pricing, and capacity controls.',
  color: 'from-violet-500 to-purple-600',
 },
 {
  step: '03',
  icon: CheckCircle2,
  title: 'Book and manage',
  description: 'Instant booking with real-time confirmations. Track your bookings, receive notifications, and manage everything from your dashboard.',
  color: 'from-emerald-500 to-teal-600',
 },
];

export default function HowItWorks() {
 return (
  <section id="how-it-works" className="py-24 bg-surface-50">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
     initial={{ opacity: 0, y: 12 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: '-80px' }}
     transition={{ duration: 0.4 }}
     className="text-center mb-16"
    >
     <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">How it works</span>
     <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mt-3 mb-4 tracking-tight">
      Get started in three simple steps
     </h2>
     <p className="text-surface-400 text-lg max-w-2xl mx-auto">
      No complicated setup. No training required. Just sign up and go.
     </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     {steps.map((step, index) => (
      <motion.div
       key={step.step}
       initial={{ opacity: 0, y: 16 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: '-40px' }}
       transition={{ duration: 0.4, delay: index * 0.1 }}
       className="relative text-center"
      >
       {index < steps.length - 1 && (
        <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-white/[0.08]" />
       )}

       <div className="relative inline-flex mb-6">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-card-lg`}>
         <step.icon className="w-8 h-8 text-white" />
        </div>
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-surface-50 rounded-full border-2 border-white/[0.1] flex items-center justify-center text-xs font-bold text-surface-700">
         {step.step}
        </span>
       </div>

       <h3 className="text-lg font-semibold text-surface-800 mb-2">{step.title}</h3>
       <p className="text-sm text-surface-400 leading-relaxed max-w-sm mx-auto">{step.description}</p>
      </motion.div>
     ))}
    </div>
   </div>
  </section>
 );
}
