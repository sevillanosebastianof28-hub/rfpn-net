import { useState, useEffect } from 'react';
import { Code2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackingCode {
  id: string;
  name: string;
  provider_type: string;
  target_page: string;
  placement: string;
  tracking_id: string | null;
  code_snippet: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PROVIDERS = [
  { value: 'google_tag_manager', label: 'Google Tag Manager' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_pixel', label: 'Meta Pixel' },
  { value: 'custom_script', label: 'Custom Script' },
];

const PLACEMENTS = [
  { value: 'head', label: 'Head' },
  { value: 'body_start', label: 'Body Start' },
  { value: 'body_end', label: 'Body End' },
];

const PAGES = [
  { value: 'all', label: 'All Pages' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'book-appointment', label: 'Book Appointment' },
  { value: 'thank-you', label: 'Thank You' },
  { value: 'development-funding', label: 'Development Funding' },
  { value: 'bridging-finance', label: 'Bridging Finance' },
];

const emptyForm = {
  name: '',
  provider_type: 'google_tag_manager',
  target_page: 'all',
  placement: 'head',
  tracking_id: '',
  code_snippet: '',
  is_active: true,
};

export default function TrackingCodes() {
  const [codes, setCodes] = useState<TrackingCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCodes = async () => {
    const { data, error } = await supabase
      .from('tracking_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCodes(data);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (code: TrackingCode) => {
    setEditingId(code.id);
    setForm({
      name: code.name,
      provider_type: code.provider_type,
      target_page: code.target_page,
      placement: code.placement,
      tracking_id: code.tracking_id || '',
      code_snippet: code.code_snippet || '',
      is_active: code.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (form.provider_type === 'google_tag_manager') {
      if (!form.tracking_id.trim() || !/^GTM-[A-Z0-9]+$/.test(form.tracking_id.trim())) {
        toast.error('Enter a valid GTM container ID (e.g. GTM-XXXXXXX)');
        return;
      }
    } else if (!form.code_snippet.trim() && !form.tracking_id.trim()) {
      toast.error('Tracking ID or code snippet is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      provider_type: form.provider_type,
      target_page: form.target_page,
      placement: form.provider_type === 'google_tag_manager' ? 'head' : form.placement,
      tracking_id: form.tracking_id.trim() || null,
      code_snippet: form.code_snippet.trim() || null,
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('tracking_codes').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('tracking_codes').insert(payload));
    }

    setSaving(false);
    if (error) { toast.error('Failed to save: ' + error.message); return; }
    toast.success(editingId ? 'Tracking code updated' : 'Tracking code created');
    setDialogOpen(false);
    fetchCodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tracking code?')) return;
    const { error } = await supabase.from('tracking_codes').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    toast.success('Deleted');
    fetchCodes();
  };

  const handleToggle = async (id: string, current: boolean) => {
    const { error } = await supabase.from('tracking_codes').update({ is_active: !current }).eq('id', id);
    if (error) { toast.error('Update failed'); return; }
    fetchCodes();
  };

  const providerLabel = (t: string) => PROVIDERS.find(p => p.value === t)?.label || t;
  const pageLabel = (t: string) => PAGES.find(p => p.value === t)?.label || t;

  const isGTM = form.provider_type === 'google_tag_manager';

  const publishedBase = 'https://rfpn-net.lovable.app';
  const campaignUrls = [
    { label: 'Book Appointment', url: `${publishedBase}/book-appointment` },
    { label: 'Development Funding', url: `${publishedBase}/development-funding` },
    { label: 'Bridging Finance', url: `${publishedBase}/bridging-finance` },
    { label: 'Thank You (Conversion)', url: `${publishedBase}/thank-you` },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Tracking Codes" description="Manage marketing scripts, GTM, and conversion tracking" />

      {/* Campaign URLs Reference */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Campaign-Ready URLs</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {campaignUrls.map(u => (
            <div key={u.url} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{u.label}:</span>
              <code className="truncate text-xs text-muted-foreground">{u.url}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Tracking Code</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Target Page</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : codes.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tracking codes configured</TableCell></TableRow>
            ) : codes.map(code => (
              <TableRow key={code.id}>
                <TableCell className="font-medium">{code.name}</TableCell>
                <TableCell><Badge variant="secondary">{providerLabel(code.provider_type)}</Badge></TableCell>
                <TableCell>{pageLabel(code.target_page)}</TableCell>
                <TableCell className="capitalize">{code.placement.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Switch checked={code.is_active} onCheckedChange={() => handleToggle(code.id, code.is_active)} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(code.updated_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(code)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(code.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} Tracking Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main GTM Container" />
            </div>
            <div>
              <Label>Provider</Label>
              <Select value={form.provider_type} onValueChange={v => setForm(f => ({ ...f, provider_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isGTM ? (
              <>
                <div>
                  <Label>GTM Container ID</Label>
                  <Input value={form.tracking_id} onChange={e => setForm(f => ({ ...f, tracking_id: e.target.value.toUpperCase() }))} placeholder="GTM-XXXXXXX" />
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Auto-generated placements:</p>
                  <p>✓ Head script — injected into &lt;head&gt;</p>
                  <p>✓ Body noscript — injected at body start</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Tracking ID (optional)</Label>
                  <Input value={form.tracking_id} onChange={e => setForm(f => ({ ...f, tracking_id: e.target.value }))} placeholder="e.g. AW-123456789" />
                </div>
                <div>
                  <Label>Code Snippet</Label>
                  <Textarea rows={6} value={form.code_snippet} onChange={e => setForm(f => ({ ...f, code_snippet: e.target.value }))} placeholder="Paste your script tag or tracking code here..." className="font-mono text-xs" />
                </div>
                <div>
                  <Label>Placement</Label>
                  <Select value={form.placement} onValueChange={v => setForm(f => ({ ...f, placement: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLACEMENTS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label>Target Page</Label>
              <Select value={form.target_page} onValueChange={v => setForm(f => ({ ...f, target_page: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
