import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];

export default function Applications() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    supabase.from('applications').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data || []); setLoading(false); });
  }, []);

  const filtered = apps.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', render: (a: AppRow) => <span className="font-mono text-sm text-muted-foreground">{a.id.slice(0, 8)}</span> },
    { key: 'title', header: 'Title', render: (a: AppRow) => <span className="font-medium">{a.title}</span> },
    { key: 'type', header: 'Type' },
    { key: 'amount', header: 'Amount', render: (a: AppRow) => <span className="font-semibold">{a.amount ? `£${Number(a.amount).toLocaleString()}` : '—'}</span> },
    { key: 'created_at', header: 'Created', render: (a: AppRow) => <span className="text-muted-foreground">{format(new Date(a.created_at), 'MMM d, yyyy')}</span> },
    { key: 'status', header: 'Status', render: (a: AppRow) => <StatusBadge status={a.status as any} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Applications" description="View and manage funding applications across all contacts" />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input placeholder="Search applications..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="info_requested">Info Requested</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filtered} isLoading={loading}
        emptyState={{ icon: <FileText className="h-8 w-8 text-muted-foreground" />, title: 'No applications found', description: 'Applications will appear here once submitted' }}
      />
    </div>
  );
}
