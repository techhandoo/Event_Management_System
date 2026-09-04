import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface ActivityItem {
 id: string | number;
 icon: ReactNode;
 iconBg: string;
 title: string;
 description: string;
 timestamp: string;
}

interface ActivityFeedProps {
 items: ActivityItem[];
 maxItems?: number;
}

export default function ActivityFeed({ items, maxItems = 8 }: ActivityFeedProps) {
 const visible = items.slice(0, maxItems);

 return (
  <div className="space-y-0">
   {visible.map((item, i) => (
    <motion.div
     key={item.id}
     initial={{ opacity: 0, x: -8 }}
     animate={{ opacity: 1, x: 0 }}
     transition={{ duration: 0.2, delay: i * 0.04 }}
     className="flex items-start gap-3 py-3 border-b border-surface-100 last:border-0"
    >
     <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
      {item.icon}
     </div>
     <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-surface-800">{item.title}</p>
      <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{item.description}</p>
     </div>
     <span className="text-[11px] text-surface-400 whitespace-nowrap flex-shrink-0">{item.timestamp}</span>
    </motion.div>
   ))}
   {items.length === 0 && (
    <p className="text-sm text-surface-400 text-center py-8">No recent activity</p>
   )}
  </div>
 );
}
