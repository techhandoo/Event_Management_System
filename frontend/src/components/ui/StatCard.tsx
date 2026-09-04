import { motion } from 'framer-motion';

interface StatCardProps {
 icon: React.ReactNode;
 label: string;
 value: number | string;
 sub?: string;
 delay?: number;
 accent?: 'brand' | 'success' | 'warning' | 'danger';
}

const ACCENTS = {
 brand:  { bg: 'bg-brand-50', icon: 'text-brand-600' },
 success: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
 warning: { bg: 'bg-amber-50', icon: 'text-amber-600' },
 danger: { bg: 'bg-red-50', icon: 'text-red-600' },
};

export default function StatCard({ icon, label, value, sub, delay = 0, accent = 'brand' }: StatCardProps) {
 const a = ACCENTS[accent];
 return (
  <motion.div
   initial={{ opacity: 0, y: 8 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.3, delay }}
   className="card-hover p-5"
  >
   <div className="flex items-start justify-between">
    <div className="min-w-0 flex-1">
     <p className="text-[13px] font-medium text-surface-500">{label}</p>
     <p className="text-2xl font-bold text-surface-800 tabular-nums mt-1">{value}</p>
     {sub && <p className="text-xs text-surface-400 mt-1 truncate">{sub}</p>}
    </div>
    <div className={`flex-shrink-0 p-2.5 rounded-xl ${a.bg} ${a.icon}`}>
     {icon}
    </div>
   </div>
  </motion.div>
 );
}
