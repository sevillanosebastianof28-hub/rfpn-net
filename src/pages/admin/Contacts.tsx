import { useState, useEffect } from 'react';
import { Plus, Building2, MoreHorizontal, Power, PowerOff, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logAudit } from '@/lib/audit';
import type { Database } from '@/integrations/supabase/types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

export default function Contacts() {
  const [contacts, setContacts] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContact, setNewContact] = useState({ name: '', slug: '', primaryColor: '#7c3aed', secondaryColor: '#1f2937' });

  const fetchContacts = async () => {
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newContact.name.trim() || !newContact.slug.trim()) return;
    const { error } = await supabase.from('tenants').insert({
      name: newContact.name.trim(), slug: newContact.slug.trim(),
      primary_color: newContact.primaryColor, secondary_color: newContact.secondaryColor,
    });
    if (error) { toast.error(error.message); return; }
    await logAudit({ action: 'tenant_created', resourceType: 'tenant', details: `Created: ${newContact.name}` });
    toast.success('Contact created');
    setIsCreateOpen(false);
    setNewContact({ name: '', slug: '', primaryColor: '#7c3aed', secondaryColor: '#1f2937' });
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

  const columns = [
    { key: 'name', header: 'Organization', render: (c: Tenant) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: c.primary_color }}>
          {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div><p className="font-medium">{c.name}</p><p className="text-sm text-muted-foreground">{c.slug}</p></div>
      </div>
    )},
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
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button variant="gradient"><Plus className="h-4 w-4" /> Add Contact</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Create New Contact</DialogTitle><DialogDescription>Add a new client organization</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Organization Name</Label><Input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={newContact.slug} onChange={e => setNewContact({...newContact, slug: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Primary Color</Label><div className="flex items-center gap-2"><input type="color" value={newContact.primaryColor} onChange={e => setNewContact({...newContact, primaryColor: e.target.value})} className="h-10 w-10 cursor-pointer rounded-lg border border-border" /><Input value={newContact.primaryColor} onChange={e => setNewContact({...newContact, primaryColor: e.target.value})} className="font-mono text-sm" /></div></div>
                  <div className="space-y-2"><Label>Secondary Color</Label><div className="flex items-center gap-2"><input type="color" value={newContact.secondaryColor} onChange={e => setNewContact({...newContact, secondaryColor: e.target.value})} className="h-10 w-10 cursor-pointer rounded-lg border border-border" /><Input value={newContact.secondaryColor} onChange={e => setNewContact({...newContact, secondaryColor: e.target.value})} className="font-mono text-sm" /></div></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button variant="gradient" onClick={handleCreate} disabled={!newContact.name || !newContact.slug}>Create Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-6"><Input placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" /></div>
      <DataTable columns={columns} data={filteredContacts} isLoading={loading}
        emptyState={{ icon: <Building2 className="h-8 w-8 text-muted-foreground" />, title: 'No contacts found',
          description: searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first contact',
          action: !searchQuery && <Button variant="outline" onClick={() => setIsCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Contact</Button>
        }}
      />
    </div>
  );
}
