import { Building2, Users, FileText, Activity, TrendingUp, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { mockDashboardStats, mockAuditLogs, mockApplications } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const recentLogs = mockAuditLogs.slice(0, 5);
  const recentApplications = mockApplications.slice(0, 5);

  const auditColumns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (log: typeof mockAuditLogs[0]) => (
        <span className="text-muted-foreground">
          {format(log.timestamp, 'MMM d, HH:mm')}
        </span>
      ),
    },
    {
      key: 'userEmail',
      header: 'User',
      render: (log: typeof mockAuditLogs[0]) => (
        <span className="font-medium">{log.userEmail}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: typeof mockAuditLogs[0]) => (
        <span className="capitalize">{log.action.replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      className: 'max-w-[300px] truncate',
      render: (log: typeof mockAuditLogs[0]) => (
        <span className="text-muted-foreground">{log.details}</span>
      ),
    },
  ];

  const applicationColumns = [
    {
      key: 'applicantName',
      header: 'Applicant',
      render: (app: typeof mockApplications[0]) => (
        <span className="font-medium">{app.applicantName}</span>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant',
    },
    {
      key: 'type',
      header: 'Type',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (app: typeof mockApplications[0]) => (
        <span className="font-medium">
          ${app.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app: typeof mockApplications[0]) => (
        <StatusBadge status={app.status} />
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Welcome back, ${user?.firstName}`}
        description="Here's what's happening across your platform today"
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={mockDashboardStats.totalTenants}
          subtitle={`${mockDashboardStats.activeTenants} active`}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Users"
          value={mockDashboardStats.totalUsers}
          subtitle={`${mockDashboardStats.activeUsers} active`}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Applications"
          value={mockDashboardStats.pendingApplications}
          subtitle="Awaiting review"
          icon={FileText}
        />
        <StatCard
          title="Activity (24h)"
          value={mockDashboardStats.recentActivity}
          subtitle="Actions logged"
          icon={Activity}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </h2>
            <a href="/admin/audit-logs" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          <DataTable
            columns={auditColumns}
            data={recentLogs}
            emptyState={{
              title: 'No recent activity',
              description: 'Activity will appear here as actions are taken',
            }}
          />
        </div>

        {/* Recent Applications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Applications
            </h2>
            <a href="/admin/applications" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          <DataTable
            columns={applicationColumns}
            data={recentApplications}
            emptyState={{
              title: 'No applications yet',
              description: 'Applications will appear here once submitted',
            }}
          />
        </div>
      </div>
    </div>
  );
}
