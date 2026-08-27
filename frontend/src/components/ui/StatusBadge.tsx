import { ReactNode } from 'react';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'badge-success',
  PUBLISHED: 'badge-success',
  ACTIVE:    'badge-success',
  PENDING:   'badge-warning',
  DRAFT:     'badge-warning',
  CANCELLED: 'badge-danger',
  BANNED:    'badge-danger',
  FAILED:    'badge-danger',
  REFUNDED:  'badge-neutral',
  COMPLETED: 'badge-info',
};

interface StatusBadgeProps {
  status: string;
  icon?: ReactNode;
  className?: string;
}

export default function StatusBadge({ status, icon, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'badge-neutral';
  return (
    <span className={`${style} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {status}
    </span>
  );
}
