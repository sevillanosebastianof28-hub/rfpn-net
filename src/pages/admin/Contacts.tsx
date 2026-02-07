import { useState } from 'react';
import { Plus, Building2, MoreHorizontal, Power, PowerOff, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockContacts } from '@/data/mockData';
import { Contact } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Contacts() {
  const [contacts, setContacts] = useState(mockContacts);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    slug: '',
    primaryColor: '#7c3aed',
    secondaryColor: '#1f2937',
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateContact = () => {
    const contact: Contact = {
      id: `t${Date.now()}`,
      name: newContact.name,
      slug: newContact.slug,
      isActive: true,
      branding: {
        primaryColor: newContact.primaryColor,
        secondaryColor: newContact.secondaryColor,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userCount: 0,
    };
    setContacts([contact, ...contacts]);
    setIsCreateOpen(false);
    setNewContact({ name: '', slug: '', primaryColor: '#7c3aed', secondaryColor: '#1f2937' });
    toast.success('Contact created successfully');
  };

  const handleToggleStatus = (contact: Contact) => {
    setContacts(contacts.map(c => 
      c.id === contact.id ? { ...c, isActive: !c.isActive } : c
    ));
    toast.success(`Contact ${contact.isActive ? 'deactivated' : 'activated'}`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Tenant',
      render: (contact: Contact) => (
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: contact.branding.primaryColor }}
          >
            {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium">{contact.name}</p>
            <p className="text-sm text-muted-foreground">{contact.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'userCount',
      header: 'Users',
      render: (contact: Contact) => (
        <span className="font-medium">{contact.userCount}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (contact: Contact) => (
        <span className="text-muted-foreground">
          {format(contact.createdAt, 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (contact: Contact) => (
        <StatusBadge status={contact.isActive} />
      ),
    },
    {
      key: 'branding',
      header: 'Branding',
      render: (contact: Contact) => (
        <div className="flex items-center gap-2">
          <div 
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: contact.branding.primaryColor }}
            title="Primary"
          />
          <div 
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: contact.branding.secondaryColor }}
            title="Secondary"
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (contact: Contact) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(contact)}>
              {contact.isActive ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Contacts"
        description="Manage client organizations and their branding settings"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Contact</DialogTitle>
                <DialogDescription>
                  Add a new client organization to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    placeholder="Acme Corporation"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="acme-corp"
                    value={newContact.slug}
                    onChange={(e) => setNewContact({ ...newContact, slug: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={newContact.primaryColor}
                        onChange={(e) => setNewContact({ ...newContact, primaryColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                      />
                      <Input
                        value={newContact.primaryColor}
                        onChange={(e) => setNewContact({ ...newContact, primaryColor: e.target.value })}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={newContact.secondaryColor}
                        onChange={(e) => setNewContact({ ...newContact, secondaryColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                      />
                      <Input
                        value={newContact.secondaryColor}
                        onChange={(e) => setNewContact({ ...newContact, secondaryColor: e.target.value })}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="gradient" 
                  onClick={handleCreateContact}
                  disabled={!newContact.name || !newContact.slug}
                >
                  Create Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="mb-6">
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredContacts}
        emptyState={{
          icon: <Building2 className="h-8 w-8 text-muted-foreground" />,
          title: 'No contacts found',
          description: searchQuery 
            ? 'Try adjusting your search query'
            : 'Get started by adding your first contact',
          action: !searchQuery && (
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          ),
        }}
      />
    </div>
  );
}
