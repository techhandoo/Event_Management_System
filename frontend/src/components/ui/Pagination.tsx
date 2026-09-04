import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
 page: number;
 totalPages: number;
 onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
 if (totalPages <= 1) return null;

 return (
  <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100">
   <button
    onClick={() => onPageChange(Math.max(0, page - 1))}
    disabled={page === 0}
    className="btn-ghost btn-sm disabled:opacity-40"
   >
    <ChevronLeft size={14} /> Previous
   </button>
   <span className="text-xs text-surface-500 tabular-nums font-medium">
    Page {page + 1} of {totalPages}
   </span>
   <button
    onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
    disabled={page >= totalPages - 1}
    className="btn-ghost btn-sm disabled:opacity-40"
   >
    Next <ChevronRight size={14} />
   </button>
  </div>
 );
}
