import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
 CONFIRMED: 'badge-success',
 PUBLISHED: 'badge-success',
 ACTIVE:  'badge-success',
 PENDING:  'badge-warning',
 DRAFT:   'badge-warning',
 CANCELLED: 'badge-danger',
 BANNED:  'badge-danger',
 FAILED:  'badge-danger',
 REFUNDED: 'badge-info',
 COMPLETED: 'badge-brand',
};

interface StatusBadgeProps {
 status: string;
 icon?: ReactNode;
 className?: string;
}

export default function StatusBadge({ status, icon, className = '' }: StatusBadgeProps) {
 const style = STATUS_STYLES[status] || 'badge-info';
 return (
  <span className={cn(style, className)}>
   {icon && <span className="mr-1">{icon}</span>}
   {status}
  </span>
 );
}
