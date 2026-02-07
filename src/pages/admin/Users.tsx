import { useState } from 'react';
import { Users as UsersIcon, MoreHorizontal, Power, PowerOff, Shield, Mail, Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockUsers, mockContacts } from '@/data/mockData';
import { User, UserRole } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { UserFormDialog } from '@/components/UserFormDialog';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  central_admin: 'Central Admin',
  developer: 'Developer',
  broker: 'Broker',
};

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-primary/20 text-primary',
  central_admin: 'bg-success/20 text-success',
  developer: 'bg-warning/20 text-warning',
  broker: 'bg-muted text-muted-foreground',
};

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTenant = tenantFilter === 'all' || user.tenantId === tenantFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesTenant && matchesRole && matchesStatus;
  });

  const handleToggleStatus = (user: User) => {
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, isActive: !u.isActive } : u
    ));
    toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
  };

  const handleSaveUser = (savedUser: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === savedUser.id);
      if (exists) {
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
      }
      return [savedUser, ...prev];
    });
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const getContactName = (tenantId: string | null) => {
    if (!tenantId) return 'Platform';
    const contact = mockContacts.find(c => c.id === tenantId);
    return contact?.name || 'Unknown';
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tenantId',
      header: 'Organization',
      render: (user: User) => (
        <span>{getContactName(user.tenantId)}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${roleColors[user.role]}`}>
          {roleLabels[user.role]}
        </span>
      ),
    },
    {
      key: 'isVerified',
      header: 'Verified',
      render: (user: User) => (
        <StatusBadge status={user.isVerified} type="verification" />
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (user: User) => (
        <StatusBadge status={user.isActive} />
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      render: (user: User) => (
        <span className="text-muted-foreground">
          {user.lastLoginAt ? format(user.lastLoginAt, 'MMM d, yyyy') : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditUser(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
              {user.isActive ? (
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Users"
        description="Manage platform users across all organizations"
        actions={
          <Button variant="gradient" onClick={handleCreateUser}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {mockContacts.map(contact => (
              <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="central_admin">Central Admin</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="broker">Broker</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyState={{
          icon: <UsersIcon className="h-8 w-8 text-muted-foreground" />,
          title: 'No users found',
          description: 'Try adjusting your search or filter criteria',
        }}
      />

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
