import { useState } from 'react';
import { FileText, Filter } from 'lucide-react';
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
import { mockApplications, mockTenants } from '@/data/mockData';
import { Application } from '@/types';
import { format } from 'date-fns';

export default function Applications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesTenant = tenantFilter === 'all' || app.tenantId === tenantFilter;

    return matchesSearch && matchesStatus && matchesTenant;
  });

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (app: Application) => (
        <span className="font-mono text-sm text-muted-foreground">
          {app.id.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'applicantName',
      header: 'Applicant',
      render: (app: Application) => (
        <span className="font-medium">{app.applicantName}</span>
      ),
    },
    {
      key: 'tenantName',
      header: 'Organization',
    },
    {
      key: 'type',
      header: 'Type',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (app: Application) => (
        <span className="font-semibold">
          ${app.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (app: Application) => (
        <span className="text-muted-foreground">
          {format(app.submittedAt, 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app: Application) => (
        <StatusBadge status={app.status} />
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Applications"
        description="View and manage funding applications across all tenants"
      />

      {/* Info Banner */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Admin View Only</h3>
            <p className="text-sm text-muted-foreground">
              This is a read-only oversight view. Full application management will be available in the Developer and Broker portals (Weeks 2-4).
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {mockTenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredApplications}
        emptyState={{
          icon: <FileText className="h-8 w-8 text-muted-foreground" />,
          title: 'No applications found',
          description: 'Applications will appear here once submitted through the Developer portal',
        }}
      />
    </div>
  );
}
