import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: number; label: string };
  accent?: 'brand' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const accentMap = {
  brand:   { bg: 'bg-brand-500/15', text: 'text-brand-400', glow: 'shadow-brand-500/20' },
  success: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  warning: { bg: 'bg-amber-500/15', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  danger:  { bg: 'bg-red-500/15', text: 'text-red-400', glow: 'shadow-red-500/20' },
};

export default function KPICard({ icon, label, value, sub, trend, accent = 'brand', delay = 0 }: KPICardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="card-hover p-5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
          colors.bg, colors.text,
          "group-hover:scale-110 group-hover:shadow-lg", colors.glow
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
            trend.value > 0 ? 'text-emerald-400 bg-emerald-500/10' :
            trend.value < 0 ? 'text-red-400 bg-red-500/10' :
            'text-surface-400 bg-white/[0.04]'
          )}>
            {trend.value > 0 ? <TrendingUp size={12} /> : trend.value < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-900 tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-surface-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-surface-400/60 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}
