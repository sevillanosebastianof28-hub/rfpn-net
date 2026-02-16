import { useState, useEffect } from 'react';
import { ScrollText, Download, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l => {
    const matchSearch = (l.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) || (l.details || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const columns = [
    { key: 'created_at', header: 'Timestamp', render: (l: any) => (
      <div className="flex flex-col"><span className="font-medium">{format(new Date(l.created_at), 'MMM d, yyyy')}</span><span className="text-sm text-muted-foreground">{format(new Date(l.created_at), 'HH:mm:ss')}</span></div>
    )},
    { key: 'user_email', header: 'User', render: (l: any) => <span className="font-medium">{l.user_email || '—'}</span> },
    { key: 'action', header: 'Action', render: (l: any) => <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-primary/20 text-primary capitalize">{l.action.replace(/_/g, ' ')}</span> },
    { key: 'resource_type', header: 'Resource', render: (l: any) => <span className="capitalize">{l.resource_type}</span> },
    { key: 'details', header: 'Details', className: 'max-w-[400px]', render: (l: any) => <span className="text-muted-foreground line-clamp-2">{l.details}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit Logs" description="Track all system activity and security events"
        actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div>}
      />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input placeholder="Search logs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="user_activated">User Activated</SelectItem>
            <SelectItem value="user_deactivated">User Deactivated</SelectItem>
            <SelectItem value="tenant_created">Contact Created</SelectItem>
            <SelectItem value="tenant_deactivated">Contact Deactivated</SelectItem>
            <SelectItem value="application_status_change">Status Change</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filtered} isLoading={loading}
        emptyState={{ icon: <ScrollText className="h-8 w-8 text-muted-foreground" />, title: 'No audit logs found', description: 'Activity will be logged here as events occur' }}
      />
    </div>
  );
}
