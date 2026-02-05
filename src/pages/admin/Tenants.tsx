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
import { mockTenants } from '@/data/mockData';
import { Tenant } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Tenants() {
  const [tenants, setTenants] = useState(mockTenants);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    primaryColor: '#7c3aed',
    secondaryColor: '#1f2937',
  });

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTenant = () => {
    const tenant: Tenant = {
      id: `t${Date.now()}`,
      name: newTenant.name,
      slug: newTenant.slug,
      isActive: true,
      branding: {
        primaryColor: newTenant.primaryColor,
        secondaryColor: newTenant.secondaryColor,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userCount: 0,
    };
    setTenants([tenant, ...tenants]);
    setIsCreateOpen(false);
    setNewTenant({ name: '', slug: '', primaryColor: '#7c3aed', secondaryColor: '#1f2937' });
    toast.success('Tenant created successfully');
  };

  const handleToggleStatus = (tenant: Tenant) => {
    setTenants(tenants.map(t => 
      t.id === tenant.id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success(`Tenant ${tenant.isActive ? 'deactivated' : 'activated'}`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Tenant',
      render: (tenant: Tenant) => (
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: tenant.branding.primaryColor }}
          >
            {tenant.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium">{tenant.name}</p>
            <p className="text-sm text-muted-foreground">{tenant.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'userCount',
      header: 'Users',
      render: (tenant: Tenant) => (
        <span className="font-medium">{tenant.userCount}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (tenant: Tenant) => (
        <span className="text-muted-foreground">
          {format(tenant.createdAt, 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (tenant: Tenant) => (
        <StatusBadge status={tenant.isActive} />
      ),
    },
    {
      key: 'branding',
      header: 'Branding',
      render: (tenant: Tenant) => (
        <div className="flex items-center gap-2">
          <div 
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: tenant.branding.primaryColor }}
            title="Primary"
          />
          <div 
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: tenant.branding.secondaryColor }}
            title="Secondary"
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (tenant: Tenant) => (
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
            <DropdownMenuItem onClick={() => handleToggleStatus(tenant)}>
              {tenant.isActive ? (
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
        title="Tenants"
        description="Manage client organizations and their branding settings"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
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
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="acme-corp"
                    value={newTenant.slug}
                    onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={newTenant.primaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                      />
                      <Input
                        value={newTenant.primaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
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
                        value={newTenant.secondaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, secondaryColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                      />
                      <Input
                        value={newTenant.secondaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, secondaryColor: e.target.value })}
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
                  onClick={handleCreateTenant}
                  disabled={!newTenant.name || !newTenant.slug}
                >
                  Create Tenant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="mb-6">
        <Input
          placeholder="Search tenants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredTenants}
        emptyState={{
          icon: <Building2 className="h-8 w-8 text-muted-foreground" />,
          title: 'No tenants found',
          description: searchQuery 
            ? 'Try adjusting your search query'
            : 'Get started by adding your first tenant',
          action: !searchQuery && (
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          ),
        }}
      />
    </div>
  );
}
