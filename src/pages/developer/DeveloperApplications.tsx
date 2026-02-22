import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileText, Loader2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];

export default function DeveloperApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editApp, setEditApp] = useState<AppRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'development_funding', amount: '', description: '' });

  const fetchApps = async () => {
    if (!user) return;
    const { data } = await supabase.from('applications').select('*').eq('developer_id', user.id).order('created_at', { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [user]);

  const openCreate = () => {
    setEditApp(null);
    setForm({ title: '', type: 'development_funding', amount: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (app: AppRow) => {
    setEditApp(app);
    const desc = (app.project_details as any)?.description || '';
    setForm({ title: app.title, type: app.type, amount: app.amount?.toString() || '', description: desc });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    if (editApp) {
      // Update existing
      const { error } = await supabase.from('applications').update({
        title: form.title.trim(),
        type: form.type,
        amount: form.amount ? parseFloat(form.amount) : null,
        project_details: { description: form.description },
      }).eq('id', editApp.id);
      if (error) toast.error('Failed to update');
      else toast.success('Application updated');
    } else {
      // Create new
      const { error } = await supabase.from('applications').insert({
        developer_id: user.id,
        title: form.title.trim(),
        type: form.type,
        amount: form.amount ? parseFloat(form.amount) : null,
        project_details: { description: form.description },
        tenant_id: user.tenantId,
      });
      if (error) toast.error('Failed to create application');
      else toast.success('Application created');
    }
    setDialogOpen(false);
    fetchApps();
    setSaving(false);
  };

  const handleSubmit = async (appId: string) => {
    await supabase.from('applications').update({
      status: 'submitted' as any,
      submitted_at: new Date().toISOString(),
    }).eq('id', appId);
    toast.success('Application submitted');
    fetchApps();
  };

  const columns = [
    { key: 'title', header: 'Title', render: (app: AppRow) => (
      <button className="font-medium text-primary hover:underline text-left" onClick={() => openEdit(app)}>{app.title}</button>
    )},
    { key: 'type', header: 'Type' },
    { key: 'amount', header: 'Amount', render: (app: AppRow) => <span>{app.amount ? `£${Number(app.amount).toLocaleString()}` : '—'}</span> },
    { key: 'status', header: 'Status', render: (app: AppRow) => <StatusBadge status={app.status as any} /> },
    { key: 'created_at', header: 'Created', render: (app: AppRow) => <span className="text-muted-foreground">{format(new Date(app.created_at), 'MMM d, yyyy')}</span> },
    { key: 'actions', header: '', className: 'w-32', render: (app: AppRow) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openEdit(app)}><Pencil className="h-4 w-4" /></Button>
        {app.status === 'draft' && <Button size="sm" variant="outline" onClick={() => handleSubmit(app.id)}>Submit</Button>}
      </div>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Applications" description="Manage your funding applications"
        actions={<Button variant="gradient" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Application</Button>}
      />
      <DataTable columns={columns} data={apps} isLoading={loading}
        emptyState={{ icon: <FileText className="h-8 w-8 text-muted-foreground" />, title: 'No applications', description: 'Create your first funding application' }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editApp ? 'Edit Application' : 'New Application'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Project Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Funding Amount (£)</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
            <div className="space-y-2"><Label>Project Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editApp ? 'Save Changes' : 'Create Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
