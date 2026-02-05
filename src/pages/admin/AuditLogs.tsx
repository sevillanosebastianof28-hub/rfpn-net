import { useState } from 'react';
import { ScrollText, Download, Calendar, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockAuditLogs } from '@/data/mockData';
import { AuditLog, AuditAction } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const actionConfig: Record<AuditAction, { label: string; color: string }> = {
  login: { label: 'Login', color: 'bg-success/20 text-success' },
  logout: { label: 'Logout', color: 'bg-muted text-muted-foreground' },
  role_change: { label: 'Role Change', color: 'bg-primary/20 text-primary' },
  user_activated: { label: 'User Activated', color: 'bg-success/20 text-success' },
  user_deactivated: { label: 'User Deactivated', color: 'bg-destructive/20 text-destructive' },
  tenant_created: { label: 'Tenant Created', color: 'bg-success/20 text-success' },
  tenant_updated: { label: 'Tenant Updated', color: 'bg-warning/20 text-warning' },
  tenant_activated: { label: 'Tenant Activated', color: 'bg-success/20 text-success' },
  tenant_deactivated: { label: 'Tenant Deactivated', color: 'bg-destructive/20 text-destructive' },
  application_created: { label: 'Application Created', color: 'bg-primary/20 text-primary' },
  application_status_change: { label: 'Status Change', color: 'bg-warning/20 text-warning' },
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resourceType === resourceFilter;

    return matchesSearch && matchesAction && matchesResource;
  });

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log: AuditLog) => (
        <div className="flex flex-col">
          <span className="font-medium">{format(log.timestamp, 'MMM d, yyyy')}</span>
          <span className="text-sm text-muted-foreground">{format(log.timestamp, 'HH:mm:ss')}</span>
        </div>
      ),
    },
    {
      key: 'userEmail',
      header: 'User',
      render: (log: AuditLog) => (
        <span className="font-medium">{log.userEmail}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => {
        const config = actionConfig[log.action];
        return (
          <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', config.color)}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'resourceType',
      header: 'Resource',
      render: (log: AuditLog) => (
        <span className="capitalize">{log.resourceType}</span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      className: 'max-w-[400px]',
      render: (log: AuditLog) => (
        <span className="text-muted-foreground line-clamp-2">{log.details}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (log: AuditLog) => (
        <span className="font-mono text-sm text-muted-foreground">{log.ipAddress}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Audit Logs"
        description="Track all system activity and security events"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="role_change">Role Change</SelectItem>
            <SelectItem value="user_activated">User Activated</SelectItem>
            <SelectItem value="user_deactivated">User Deactivated</SelectItem>
            <SelectItem value="tenant_created">Tenant Created</SelectItem>
            <SelectItem value="tenant_deactivated">Tenant Deactivated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="application">Application</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        emptyState={{
          icon: <ScrollText className="h-8 w-8 text-muted-foreground" />,
          title: 'No audit logs found',
          description: 'Activity will be logged here as events occur',
        }}
      />
    </div>
  );
}
