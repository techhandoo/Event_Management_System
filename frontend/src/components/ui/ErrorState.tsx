import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="p-4 bg-red-50 rounded-2xl mb-4">
        <AlertTriangle size={32} className="text-red-400" />
      </div>
      <p className="text-sm font-semibold text-surface-900">{title}</p>
      <p className="text-xs text-surface-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-4">
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </motion.div>
  );
}
