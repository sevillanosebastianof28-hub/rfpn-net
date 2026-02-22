import { useEffect, useState } from 'react';
import { Building2, Users, FileText, Activity, TrendingUp, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalContacts: 0, activeContacts: 0, totalUsers: 0, activeUsers: 0, pendingApps: 0, recentActivity: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('tenants').select('id, is_active'),
      supabase.from('profiles').select('id, is_active'),
      supabase.from('applications').select('id, status'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('applications').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([tenants, users, apps, logs, recentAppsRes]) => {
      const t = tenants.data || [];
      const u = users.data || [];
      const a = apps.data || [];
      setStats({
        totalContacts: t.length,
        activeContacts: t.filter(x => x.is_active).length,
        totalUsers: u.length,
        activeUsers: u.filter(x => x.is_active).length,
        pendingApps: a.filter(x => ['submitted', 'under_review'].includes(x.status)).length,
        recentActivity: (logs.data || []).length,
      });
      setRecentLogs(logs.data || []);
      setRecentApps(recentAppsRes.data || []);
      setLoading(false);
    });
  }, []);

  const auditColumns = [
    { key: 'created_at', header: 'Time', render: (log: any) => <span className="text-muted-foreground">{format(new Date(log.created_at), 'MMM d, HH:mm')}</span> },
    { key: 'user_email', header: 'User', render: (log: any) => <span className="font-medium">{log.user_email || '—'}</span> },
    { key: 'action', header: 'Action', render: (log: any) => <span className="capitalize">{log.action.replace(/_/g, ' ')}</span> },
    { key: 'details', header: 'Details', className: 'max-w-[300px] truncate', render: (log: any) => <span className="text-muted-foreground">{log.details}</span> },
  ];

  const appColumns = [
    { key: 'title', header: 'Title', render: (app: any) => <span className="font-medium">{app.title}</span> },
    { key: 'type', header: 'Type' },
    { key: 'amount', header: 'Amount', render: (app: any) => <span className="font-medium">{app.amount ? `£${Number(app.amount).toLocaleString()}` : '—'}</span> },
    { key: 'status', header: 'Status', render: (app: any) => <StatusBadge status={app.status} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Welcome back, ${user?.firstName}`} description="Here's what's happening across your platform today" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contacts" value={stats.totalContacts} subtitle={`${stats.activeContacts} active`} icon={Building2} href="/admin/contacts" />
        <StatCard title="Total Users" value={stats.totalUsers} subtitle={`${stats.activeUsers} active`} icon={Users} href="/admin/users" />
        <StatCard title="Pending Applications" value={stats.pendingApps} subtitle="Awaiting review" icon={FileText} href="/admin/applications" />
        <StatCard title="Activity (Recent)" value={stats.recentActivity} subtitle="Actions logged" icon={Activity} href="/admin/audit-logs" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5 text-primary" /> Recent Activity</h2>
            <a href="/admin/audit-logs" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <DataTable columns={auditColumns} data={recentLogs} isLoading={loading} emptyState={{ title: 'No recent activity' }} />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp className="h-5 w-5 text-primary" /> Recent Applications</h2>
            <a href="/admin/applications" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <DataTable columns={appColumns} data={recentApps} isLoading={loading} emptyState={{ title: 'No applications yet' }} />
        </div>
      </div>
    </div>
  );
}
