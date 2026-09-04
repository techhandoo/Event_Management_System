import { useState } from 'react';
import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
 const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
 const [loading, setLoading] = useState(false);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setTimeout(() => {
   toast.success('Message sent! We\'ll get back to you within 24 hours.');
   setForm({ name: '', email: '', subject: '', message: '' });
   setLoading(false);
  }, 1000);
 };

 return (
  <StaticPageLayout>
   <div className="text-center mb-12">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">Contact</motion.span>
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
    >
     Get in <span className="gradient-text">touch</span>
    </motion.h1>
    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-surface-400 max-w-xl mx-auto">
     Have a question, feedback, or need help? We'd love to hear from you.
    </motion.p>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="surface-card p-6 text-center">
     <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 mx-auto mb-3">
      <Mail className="w-5 h-5" />
     </div>
     <h3 className="text-sm font-semibold text-white mb-1">Email</h3>
     <p className="text-sm text-surface-400">support@eventry.app</p>
    </motion.div>
    <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }} className="surface-card p-6 text-center">
     <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400 mx-auto mb-3">
      <MessageSquare className="w-5 h-5" />
     </div>
     <h3 className="text-sm font-semibold text-white mb-1">Live Chat</h3>
     <p className="text-sm text-surface-400">Available Mon-Fri, 9am-6pm</p>
    </motion.div>
    <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }} className="surface-card p-6 text-center">
     <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mx-auto mb-3">
      <Send className="w-5 h-5" />
     </div>
     <h3 className="text-sm font-semibold text-white mb-1">Response Time</h3>
     <p className="text-sm text-surface-400">Within 24 hours</p>
    </motion.div>
   </div>

   <motion.form
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    onSubmit={handleSubmit}
    className="surface-card p-8 space-y-6"
   >
    <h2 className="text-xl font-bold text-white">Send us a message</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
     <div className="form-item">
      <label className="label">Name</label>
      <input
       type="text"
       value={form.name}
       onChange={(e) => setForm({ ...form, name: e.target.value })}
       className="input"
       placeholder="Your name"
       required
      />
     </div>
     <div className="form-item">
      <label className="label">Email</label>
      <input
       type="email"
       value={form.email}
       onChange={(e) => setForm({ ...form, email: e.target.value })}
       className="input"
       placeholder="you@example.com"
       required
      />
     </div>
    </div>
    <div className="form-item">
     <label className="label">Subject</label>
     <input
      type="text"
      value={form.subject}
      onChange={(e) => setForm({ ...form, subject: e.target.value })}
      className="input"
      placeholder="How can we help?"
      required
     />
    </div>
    <div className="form-item">
     <label className="label">Message</label>
     <textarea
      value={form.message}
      onChange={(e) => setForm({ ...form, message: e.target.value })}
      rows={5}
      className="input resize-y"
      placeholder="Tell us more..."
      required
     />
    </div>
    <button type="submit" disabled={loading} className="btn-primary h-11 px-8">
     {loading ? 'Sending...' : 'Send Message'}
    </button>
   </motion.form>
  </StaticPageLayout>
 );
}
