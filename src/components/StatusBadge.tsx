import { cn } from '@/lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'verified' | 'unverified' | 'approved' | 'rejected' | 'under_review';

interface StatusBadgeProps {
  status: StatusType | boolean;
  type?: 'default' | 'verification' | 'application';
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Active', className: 'status-active' },
  inactive: { label: 'Inactive', className: 'status-inactive' },
  pending: { label: 'Pending', className: 'status-pending' },
  verified: { label: 'Verified', className: 'status-active' },
  unverified: { label: 'Unverified', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-active' },
  rejected: { label: 'Rejected', className: 'bg-destructive/20 text-destructive' },
  under_review: { label: 'Under Review', className: 'bg-primary/20 text-primary' },
};

export function StatusBadge({ status, type = 'default', className }: StatusBadgeProps) {
  let statusKey: StatusType;
  
  if (typeof status === 'boolean') {
    if (type === 'verification') {
      statusKey = status ? 'verified' : 'unverified';
    } else {
      statusKey = status ? 'active' : 'inactive';
    }
  } else {
    statusKey = status;
  }
  
  const config = statusConfig[statusKey];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      <span className={cn(
        'mr-1.5 h-1.5 w-1.5 rounded-full',
        statusKey === 'active' || statusKey === 'verified' || statusKey === 'approved' ? 'bg-success' :
        statusKey === 'pending' || statusKey === 'unverified' || statusKey === 'under_review' ? 'bg-warning' :
        statusKey === 'rejected' ? 'bg-destructive' : 'bg-muted-foreground'
      )} />
      {config.label}
    </span>
  );
}
