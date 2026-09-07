import { motion } from 'framer-motion';
import { Ticket, Calendar, Sparkles, Star, Zap, Users } from 'lucide-react';

/**
 * Animated, event-themed backdrop used on auth & public pages.
 * Floating tickets, calendars, stars and gradient orbs drift upward
 * with CSS-friendly transforms (GPU accelerated, pointer-events none).
 */
interface BackdropItem {
  icon: typeof Ticket;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotate: number;
}

const ITEMS: BackdropItem[] = [
  { icon: Ticket, left: '8%', size: 26, duration: 16, delay: 0, opacity: 0.16, rotate: -12 },
  { icon: Calendar, left: '22%', size: 20, duration: 19, delay: 2, opacity: 0.12, rotate: 10 },
  { icon: Star, left: '36%', size: 14, duration: 14, delay: 1, opacity: 0.2, rotate: 0 },
  { icon: Sparkles, left: '52%', size: 22, duration: 21, delay: 3, opacity: 0.14, rotate: 15 },
  { icon: Users, left: '66%', size: 24, duration: 17, delay: 0.5, opacity: 0.12, rotate: -8 },
  { icon: Ticket, left: '80%', size: 18, duration: 15, delay: 4, opacity: 0.15, rotate: 20 },
  { icon: Star, left: '90%', size: 12, duration: 13, delay: 2.5, opacity: 0.2, rotate: 0 },
  { icon: Calendar, left: '45%', size: 16, duration: 23, delay: 6, opacity: 0.1, rotate: -15 },
  { icon: Zap, left: '15%', size: 14, duration: 18, delay: 7, opacity: 0.12, rotate: 25 },
];

export default function EventBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Pulsing gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -left-24 w-[480px] h-[480px] bg-brand-500/20 rounded-full blur-[130px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -bottom-32 -right-24 w-[520px] h-[520px] bg-violet-500/20 rounded-full blur-[140px]"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-fuchsia-500/15 rounded-full blur-[120px]"
      />

      {/* Floating event icons */}
      {ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[-10%]"
          style={{ left: item.left }}
          animate={{ y: [0, -420, -840], opacity: [0, item.opacity, 0], rotate: [item.rotate, item.rotate + 14, item.rotate] }}
          transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: 'linear' }}
        >
          <item.icon size={item.size} className="text-brand-300" style={{ opacity: 1 }} strokeWidth={1.5} />
        </motion.div>
      ))}

      {/* Twinkling dots */}
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={`dot-${i}`}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          style={{ left: `${(i * 7 + 3) % 100}%`, top: `${(i * 13 + 5) % 100}%` }}
          animate={{ opacity: [0.15, 0.7, 0.15], scale: [1, 1.5, 1] }}
          transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}