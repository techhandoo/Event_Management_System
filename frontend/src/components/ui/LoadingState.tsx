import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function PageLoader() {
 return (
  <div className="flex items-center justify-center py-32">
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center gap-3"
   >
    <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
    <span className="text-xs text-surface-400 font-medium">Loading...</span>
   </motion.div>
  </div>
 );
}
