import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { logAudit } from '@/lib/audit';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];
type AppStatus = Database['public']['Enums']['application_status'];

export default function BrokerApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateApp, setUpdateApp] = useState<AppRow | null>(null);
  const [newStatus, setNewStatus] = useState<AppStatus>('under_review');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    if (!user) return;
    const { data } = await supabase.from('applications').select('*').eq('assigned_broker_id', user.id).order('updated_at', { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [user]);

  const handleStatusUpdate = async () => {
    if (!updateApp) return;
    setUpdating(true);
    const timeline = Array.isArray(updateApp.status_timeline) ? updateApp.status_timeline : [];
    await supabase.from('applications').update({
      status: newStatus,
      status_timeline: [...timeline, { status: newStatus, notes, updated_by: user?.id, updated_at: new Date().toISOString() }],
      completed_at: newStatus === 'completed' ? new Date().toISOString() : updateApp.completed_at,
    }).eq('id', updateApp.id);
    await logAudit({ action: 'application_status_change', resourceType: 'application', resourceId: updateApp.id, details: `Status changed to ${newStatus}` });
    toast.success('Application updated');
    setUpdateApp(null);
    setNotes('');
    fetchApps();
    setUpdating(false);
  };

  const columns = [
    { key: 'title', header: 'Title', render: (a: AppRow) => <span className="font-medium">{a.title}</span> },
    { key: 'type', header: 'Type' },
    { key: 'amount', header: 'Amount', render: (a: AppRow) => <span>{a.amount ? `£${Number(a.amount).toLocaleString()}` : '—'}</span> },
    { key: 'status', header: 'Status', render: (a: AppRow) => <StatusBadge status={a.status as any} /> },
    { key: 'updated_at', header: 'Last Updated', render: (a: AppRow) => <span className="text-muted-foreground">{format(new Date(a.updated_at), 'MMM d, yyyy')}</span> },
    { key: 'actions', header: '', className: 'w-32', render: (a: AppRow) => (
      <Button size="sm" variant="outline" onClick={() => { setUpdateApp(a); setNewStatus(a.status); }}>Update Status</Button>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Assigned Applications" description="View and update developer applications" />
      <DataTable columns={columns} data={apps} isLoading={loading}
        emptyState={{ icon: <FileText className="h-8 w-8 text-muted-foreground" />, title: 'No assigned applications' }}
      />

      <Dialog open={!!updateApp} onOpenChange={open => !open && setUpdateApp(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Application Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newStatus} onValueChange={v => setNewStatus(v as AppStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="info_requested">Info Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Add notes for the developer..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateApp(null)}>Cancel</Button>
            <Button variant="gradient" onClick={handleStatusUpdate} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
