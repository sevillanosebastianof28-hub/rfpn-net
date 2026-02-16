import { useState, useEffect } from 'react';
import { Users as UsersIcon, MoreHorizontal, Power, PowerOff, Mail, Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { logAudit } from '@/lib/audit';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole extends Profile {
  role: AppRole;
}

const roleLabels: Record<AppRole, string> = { super_admin: 'Super Admin', central_admin: 'Central Admin', developer: 'Developer', broker: 'Broker' };
const roleColors: Record<AppRole, string> = { super_admin: 'bg-primary/20 text-primary', central_admin: 'bg-success/20 text-success', developer: 'bg-warning/20 text-warning', broker: 'bg-muted text-muted-foreground' };

export default function Users() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = async () => {
    const [profilesRes, rolesRes, tenantsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('tenants').select('*'),
    ]);
    const roleMap = new Map((rolesRes.data || []).map(r => [r.user_id, r.role]));
    setUsers((profilesRes.data || []).map(p => ({ ...p, role: roleMap.get(p.user_id) || 'developer' })));
    setTenants(tenantsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleStatus = async (u: UserWithRole) => {
    await supabase.from('profiles').update({ is_active: !u.is_active }).eq('user_id', u.user_id);
    await logAudit({ action: u.is_active ? 'user_deactivated' : 'user_activated', resourceType: 'user', resourceId: u.user_id, details: `${u.first_name} ${u.last_name}` });
    toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
    fetchUsers();
  };

  const getTenantName = (id: string | null) => {
    if (!id) return 'Platform';
    return tenants.find(t => t.id === id)?.name || 'Unknown';
  };

  const columns = [
    { key: 'name', header: 'User', render: (u: UserWithRole) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{u.first_name[0]}{u.last_name[0]}</div>
        <div><p className="font-medium">{u.first_name} {u.last_name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
      </div>
    )},
    { key: 'tenant', header: 'Organization', render: (u: UserWithRole) => <span>{getTenantName(u.tenant_id)}</span> },
    { key: 'role', header: 'Role', render: (u: UserWithRole) => <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span> },
    { key: 'is_active', header: 'Status', render: (u: UserWithRole) => <StatusBadge status={u.is_active} /> },
    { key: 'created_at', header: 'Joined', render: (u: UserWithRole) => <span className="text-muted-foreground">{format(new Date(u.created_at), 'MMM d, yyyy')}</span> },
    { key: 'actions', header: '', className: 'w-12', render: (u: UserWithRole) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
            {u.is_active ? <><PowerOff className="mr-2 h-4 w-4" />Deactivate</> : <><Power className="mr-2 h-4 w-4" />Activate</>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Users" description="Manage platform users across all organizations" />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="central_admin">Central Admin</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="broker">Broker</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filtered} isLoading={loading}
        emptyState={{ icon: <UsersIcon className="h-8 w-8 text-muted-foreground" />, title: 'No users found', description: 'Users will appear here once they register' }}
      />
    </div>
  );
}
