import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function LandingHeader() {
 const [mobileOpen, setMobileOpen] = useState(false);

 const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#stats' },
 ];

 return (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface-0/95 border-b border-white/[0.06] sticky top-0 z-50">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
     <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative w-9 h-9">
       <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-violet-500 to-brand-400 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
       <div className="relative w-9 h-9 bg-gradient-to-br from-brand-500 via-violet-500 to-brand-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
         <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
       </div>
      </div>
      <span className="text-lg font-extrabold tracking-tight">
       <span className="text-white">Event</span>
       <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">ry</span>
      </span>
     </Link>

     <nav className="hidden md:flex items-center gap-8">
      {navLinks.map((link) => (
       <a key={link.label} href={link.href} className="text-sm font-medium text-surface-400 hover:text-surface-700 transition-colors">
        {link.label}
       </a>
      ))}
     </nav>

     <div className="hidden md:flex items-center gap-3">
      <Link to="/login" className="text-sm font-medium text-surface-400 hover:text-surface-700 px-3 py-2 transition-colors">Sign in</Link>
      <Link to="/register" className="btn btn-primary h-9 px-4 text-sm">Get started</Link>
     </div>

     <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors">
      {mobileOpen ? <X className="w-5 h-5 text-surface-400" /> : <Menu className="w-5 h-5 text-surface-400" />}
     </button>
    </div>
   </div>

   <AnimatePresence>
    {mobileOpen && (
     <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden border-t border-white/[0.06] bg-surface-0/95 "
     >
      <div className="px-4 py-4 space-y-3">
       {navLinks.map((link) => (
        <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-surface-400 hover:text-surface-700 py-2">
         {link.label}
        </a>
       ))}
       <div className="pt-3 border-t border-white/[0.06] space-y-2">
        <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-surface-400 py-2">Sign in</Link>
        <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full justify-center h-9 text-sm">Get started</Link>
       </div>
      </div>
     </motion.div>
    )}
   </AnimatePresence>
  </header>
 );
}
