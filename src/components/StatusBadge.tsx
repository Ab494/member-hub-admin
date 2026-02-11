import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'expired' | 'expiring' | 'pending' | 'completed' | 'failed' | 'synced';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'status-active',
  },
  expired: {
    label: 'Expired',
    className: 'status-expired',
  },
  expiring: {
    label: 'Expiring Soon',
    className: 'status-expiring',
  },
  pending: {
    label: 'Pending',
    className: 'status-expiring',
  },
  completed: {
    label: 'Completed',
    className: 'status-active',
  },
  failed: {
    label: 'Failed',
    className: 'status-expired',
  },
  synced: {
    label: 'Synced',
    className: 'status-active',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status?.toLowerCase() as keyof typeof statusConfig];

  if (!config) {
    return (
      <span className={cn('status-badge', className)}>
        {status || 'Unknown'}
      </span>
    );
  }

  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
