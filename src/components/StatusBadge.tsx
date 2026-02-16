import { cn } from '@/lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'verified' | 'unverified' | 'approved' | 'rejected' | 'under_review' | 'draft' | 'submitted' | 'info_requested' | 'declined' | 'completed' | 'not_started' | 'in_progress' | 'passed' | 'failed' | 'manual_review';

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
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  submitted: { label: 'Submitted', className: 'status-pending' },
  info_requested: { label: 'Info Requested', className: 'bg-warning/15 text-warning' },
  declined: { label: 'Declined', className: 'bg-destructive/20 text-destructive' },
  completed: { label: 'Completed', className: 'status-active' },
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'status-pending' },
  passed: { label: 'Passed', className: 'status-active' },
  failed: { label: 'Failed', className: 'bg-destructive/20 text-destructive' },
  manual_review: { label: 'Manual Review', className: 'bg-warning/15 text-warning' },
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
        ['active', 'verified', 'approved', 'completed', 'passed'].includes(statusKey) ? 'bg-success' :
        ['pending', 'unverified', 'under_review', 'submitted', 'info_requested', 'in_progress', 'manual_review'].includes(statusKey) ? 'bg-warning' :
        ['rejected', 'declined', 'failed'].includes(statusKey) ? 'bg-destructive' : 'bg-muted-foreground'
      )} />
      {config.label}
    </span>
  );
}
