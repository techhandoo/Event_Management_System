import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-100' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
};

export default function KPICard({ icon, label, value, sub, trend, accent = 'brand', delay = 0 }: KPICardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card p-5 hover:shadow-card-hover transition-shadow duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center ${colors.text} group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.value > 0 ? 'text-emerald-700 bg-emerald-50' :
            trend.value < 0 ? 'text-red-700 bg-red-50' :
            'text-surface-500 bg-surface-100'
          }`}>
            {trend.value > 0 ? <TrendingUp size={12} /> : trend.value < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-900 tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-surface-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}
