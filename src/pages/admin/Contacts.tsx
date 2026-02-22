import { useState, useEffect } from 'react';
import { Plus, Building2, MoreHorizontal, Power, PowerOff, Pencil, Trash2, ArrowLeft, Users, FileText, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logAudit } from '@/lib/audit';
import type { Database } from '@/integrations/supabase/types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

const emptyForm = {
  name: '', slug: '', primaryColor: '#7c3aed', secondaryColor: '#1f2937',
  portal_name: '', logo_url: '',
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Tenant | null>(null);
  const [viewingContact, setViewingContact] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [contactUsers, setContactUsers] = useState<any[]>([]);
  const [contactApps, setContactApps] = useState<any[]>([]);

  const fetchContacts = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditingContact(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (contact: Tenant) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name, slug: contact.slug,
      primaryColor: contact.primary_color, secondaryColor: contact.secondary_color,
      portal_name: contact.portal_name || '', logo_url: contact.logo_url || '',
    });
    setIsFormOpen(true);
  };

  const openView = async (contact: Tenant) => {
    setViewingContact(contact);
    const [usersRes, appsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('tenant_id', contact.id),
      supabase.from('applications').select('*').eq('tenant_id', contact.id).order('created_at', { ascending: false }).limit(10),
    ]);
    setContactUsers(usersRes.data || []);
    setContactApps(appsRes.data || []);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) return;
    const payload = {
      name: formData.name.trim(), slug: formData.slug.trim(),
      primary_color: formData.primaryColor, secondary_color: formData.secondaryColor,
      portal_name: formData.portal_name.trim() || null, logo_url: formData.logo_url.trim() || null,
    };
    if (editingContact) {
      const { error } = await supabase.from('tenants').update(payload).eq('id', editingContact.id);
      if (error) { toast.error(error.message); return; }
      await logAudit({ action: 'tenant_updated', resourceType: 'tenant', resourceId: editingContact.id, details: `Updated: ${formData.name}` });
      toast.success('Contact updated');
    } else {
      const { error } = await supabase.from('tenants').insert(payload);
      if (error) { toast.error(error.message); return; }
      await logAudit({ action: 'tenant_created', resourceType: 'tenant', details: `Created: ${formData.name}` });
      toast.success('Contact created');
    }
    setIsFormOpen(false);
    setFormData(emptyForm);
    setEditingContact(null);
    fetchContacts();
  };

  const handleToggle = async (contact: Tenant) => {
    await supabase.from('tenants').update({ is_active: !contact.is_active }).eq('id', contact.id);
    await logAudit({ action: contact.is_active ? 'tenant_deactivated' : 'tenant_activated', resourceType: 'tenant', resourceId: contact.id, details: `${contact.name}` });
    toast.success(`Contact ${contact.is_active ? 'deactivated' : 'activated'}`);
    fetchContacts();
  };

  const handleDelete = async (contact: Tenant) => {
    await supabase.from('tenants').delete().eq('id', contact.id);
    toast.success('Contact deleted');
    fetchContacts();
  };

  // Detail view
  if (viewingContact) {
    return (
      <div className="animate-fade-in">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setViewingContact(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Contacts
        </Button>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: viewingContact.primary_color }}>
              {viewingContact.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{viewingContact.name}</h1>
              <p className="text-muted-foreground">{viewingContact.slug} • {viewingContact.portal_name || 'No portal name'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(viewingContact)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
            <StatusBadge status={viewingContact.is_active} />
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users ({contactUsers.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({contactApps.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Created:</span> {format(new Date(viewingContact.created_at), 'MMM d, yyyy')}</p>
                  <p><span className="text-muted-foreground">Portal Name:</span> {viewingContact.portal_name || '—'}</p>
                  <p><span className="text-muted-foreground">Logo URL:</span> {viewingContact.logo_url || '—'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Branding</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-border" style={{ backgroundColor: viewingContact.primary_color }} />
                  <div>
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground font-mono">{viewingContact.primary_color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-border" style={{ backgroundColor: viewingContact.secondary_color }} />
                  <div>
                    <p className="text-sm font-medium">Secondary</p>
                    <p className="text-xs text-muted-foreground font-mono">{viewingContact.secondary_color}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="users">
            <div className="mt-4 space-y-3">
              {contactUsers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No users assigned to this contact</p>
              ) : contactUsers.map(u => (
                <div key={u.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{u.first_name?.[0]}{u.last_name?.[0]}</div>
                    <div>
                      <p className="font-medium">{u.first_name} {u.last_name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={u.is_active} />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="applications">
            <div className="mt-4 space-y-3">
              {contactApps.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No applications for this contact</p>
              ) : contactApps.map(app => (
                <div key={app.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{app.title}</p>
                    <p className="text-sm text-muted-foreground">{app.type} • {app.amount ? `£${Number(app.amount).toLocaleString()}` : '—'}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const columns = [
    { key: 'name', header: 'Organization', render: (c: Tenant) => (
      <button onClick={() => openView(c)} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: c.primary_color }}>
          {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div><p className="font-medium text-primary hover:underline">{c.name}</p><p className="text-sm text-muted-foreground">{c.slug}</p></div>
      </button>
    )},
    { key: 'portal_name', header: 'Portal', render: (c: Tenant) => <span className="text-muted-foreground">{c.portal_name || '—'}</span> },
    { key: 'created_at', header: 'Created', render: (c: Tenant) => <span className="text-muted-foreground">{format(new Date(c.created_at), 'MMM d, yyyy')}</span> },
    { key: 'is_active', header: 'Status', render: (c: Tenant) => <StatusBadge status={c.is_active} /> },
    { key: 'branding', header: 'Branding', render: (c: Tenant) => (
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded border border-border" style={{ backgroundColor: c.primary_color }} />
        <div className="h-5 w-5 rounded border border-border" style={{ backgroundColor: c.secondary_color }} />
      </div>
    )},
    { key: 'actions', header: '', className: 'w-12', render: (c: Tenant) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => openView(c)}><Building2 className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleToggle(c)}>
            {c.is_active ? <><PowerOff className="mr-2 h-4 w-4" />Deactivate</> : <><Power className="mr-2 h-4 w-4" />Activate</>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Contacts" description="Manage client organizations and their branding"
        actions={<Button variant="gradient" onClick={openCreate}><Plus className="h-4 w-4" /> Add Contact</Button>}
      />
      <div className="mb-6"><Input placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" /></div>
      <DataTable columns={columns} data={filteredContacts} isLoading={loading}
        emptyState={{ icon: <Building2 className="h-8 w-8 text-muted-foreground" />, title: 'No contacts found',
          description: searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first contact',
          action: !searchQuery && <Button variant="outline" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Contact</Button>
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Create New Contact'}</DialogTitle>
            <DialogDescription>{editingContact ? 'Update organization details' : 'Add a new client organization'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Organization Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Portal Name</Label><Input value={formData.portal_name} onChange={e => setFormData({...formData, portal_name: e.target.value})} placeholder="e.g. Client Portal" /></div>
            <div className="space-y-2"><Label>Logo URL</Label><Input value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Primary Color</Label><div className="flex items-center gap-2"><input type="color" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="h-10 w-10 cursor-pointer rounded-lg border border-border" /><Input value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="font-mono text-sm" /></div></div>
              <div className="space-y-2"><Label>Secondary Color</Label><div className="flex items-center gap-2"><input type="color" value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} className="h-10 w-10 cursor-pointer rounded-lg border border-border" /><Input value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} className="font-mono text-sm" /></div></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSave} disabled={!formData.name || !formData.slug}>{editingContact ? 'Save Changes' : 'Create Contact'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
