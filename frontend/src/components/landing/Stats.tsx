import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 1200, suffix: '+', label: 'Events created', description: 'Growing every day' },
  { value: 8500, suffix: '+', label: 'Bookings made', description: 'And counting' },
  { value: 99, suffix: '%', label: 'Uptime', description: 'Enterprise-grade' },
  { value: 350, suffix: '+', label: 'Organizers', description: 'Across 50 cities' },
];

export default function Stats() {
  return (
    <section id="stats" className="py-24 bg-surface-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-brand-400 mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm font-semibold text-surface-800">{stat.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
