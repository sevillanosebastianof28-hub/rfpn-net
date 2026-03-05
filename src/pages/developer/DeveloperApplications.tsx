import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];

export default function DeveloperApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('applications').select('*').eq('developer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data || []); setLoading(false); });
  }, [user]);

  const columns = [
    { key: 'title', header: 'Title', render: (app: AppRow) => (
      <button className="font-medium text-primary hover:underline text-left" onClick={() => navigate(`/developer/applications/${app.id}`)}>
        {app.title}
      </button>
    )},
    { key: 'type', header: 'Type' },
    { key: 'amount', header: 'Amount', render: (app: AppRow) => <span>{app.amount ? `£${Number(app.amount).toLocaleString()}` : '—'}</span> },
    { key: 'status', header: 'Status', render: (app: AppRow) => <StatusBadge status={app.status as any} /> },
    { key: 'created_at', header: 'Created', render: (app: AppRow) => <span className="text-muted-foreground">{format(new Date(app.created_at), 'MMM d, yyyy')}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Applications" description="Manage your funding applications"
        actions={<Button variant="gradient" onClick={() => navigate('/developer/applications/new')}><Plus className="h-4 w-4 mr-1" /> New Application</Button>}
      />
      <DataTable columns={columns} data={apps} isLoading={loading}
        emptyState={{ icon: <FileText className="h-8 w-8 text-muted-foreground" />, title: 'No applications', description: 'Create your first funding application' }}
      />
    </div>
  );
}
