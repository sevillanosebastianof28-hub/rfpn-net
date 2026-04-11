import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, CheckCircle2, XCircle, Flag, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionRow {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  application_id: string | null;
  status: string;
  commission_amount: number;
  flag_reason: string | null;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
  affiliateName?: string;
  affiliateCode?: string;
  referredUserName?: string;
}

export default function Conversions() {
  const [conversions, setConversions] = useState<ConversionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; conversion?: ConversionRow }>({ open: false });
  const [editAmount, setEditAmount] = useState('');

  const fetchConversions = useCallback(async () => {
    const { data: convs } = await supabase.from('affiliate_conversions').select('*').order('created_at', { ascending: false });
    if (!convs) { setLoading(false); return; }

    const enriched = await Promise.all(convs.map(async (c) => {
      const [affRes, userRes] = await Promise.all([
        supabase.from('affiliates').select('affiliate_code, user_id').eq('id', c.affiliate_id).maybeSingle(),
        supabase.from('profiles').select('first_name, last_name').eq('user_id', c.referred_user_id).maybeSingle(),
      ]);
      let affiliateName = '';
      if (affRes.data) {
        const { data: p } = await supabase.from('profiles').select('first_name, last_name').eq('user_id', affRes.data.user_id).maybeSingle();
        affiliateName = p ? `${p.first_name} ${p.last_name}` : '';
      }
      return {
        ...c,
        commission_amount: Number(c.commission_amount),
        affiliateName,
        affiliateCode: affRes.data?.affiliate_code || '',
        referredUserName: userRes.data ? `${userRes.data.first_name} ${userRes.data.last_name}` : '',
      } as ConversionRow;
    }));

    setConversions(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchConversions(); }, [fetchConversions]);
  useRealtimeTable('affiliate_conversions', fetchConversions);

  const updateStatus = async (id: string, status: string, extra?: Record<string, any>) => {
    await supabase.from('affiliate_conversions').update({ status, ...extra }).eq('id', id);
    toast.success(`Conversion ${status}`);
    fetchConversions();
  };

  const saveCommission = async () => {
    if (!editDialog.conversion) return;
    await supabase.from('affiliate_conversions').update({ commission_amount: parseFloat(editAmount) }).eq('id', editDialog.conversion.id);
    toast.success('Commission updated');
    setEditDialog({ open: false });
    fetchConversions();
  };

  const filtered = conversions.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.affiliateName?.toLowerCase().includes(s) || c.affiliateCode?.toLowerCase().includes(s) || c.referredUserName?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Conversions" description="Track and manage affiliate conversions" />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        isLoading={loading}
        columns={[
          { key: 'affiliateName', header: 'Affiliate', render: (r: ConversionRow) => <div><p className="font-medium">{r.affiliateName}</p><p className="text-xs text-muted-foreground font-mono">{r.affiliateCode}</p></div> },
          { key: 'referredUserName', header: 'Referred User', render: (r: ConversionRow) => r.referredUserName },
          { key: 'application_id', header: 'Application', render: (r: ConversionRow) => r.application_id ? <span className="font-mono text-xs">{r.application_id.slice(0, 8)}...</span> : '—' },
          { key: 'status', header: 'Status', render: (r: ConversionRow) => (
            <div className="flex items-center gap-1">
              <StatusBadge status={r.status as any} />
              {r.flag_reason && <AlertTriangle className="h-3.5 w-3.5 text-amber" />}
            </div>
          )},
          { key: 'commission_amount', header: 'Commission', render: (r: ConversionRow) => `$${r.commission_amount.toFixed(2)}` },
          { key: 'created_at', header: 'Created', render: (r: ConversionRow) => new Date(r.created_at).toLocaleDateString() },
          { key: 'approved_at', header: 'Approved', render: (r: ConversionRow) => r.approved_at ? new Date(r.approved_at).toLocaleDateString() : '—' },
          { key: 'paid_at', header: 'Paid', render: (r: ConversionRow) => r.paid_at ? new Date(r.paid_at).toLocaleDateString() : '—' },
          { key: 'actions', header: '', render: (r: ConversionRow) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus(r.id, 'approved', { approved_at: new Date().toISOString() })}><CheckCircle2 className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(r.id, 'rejected')}><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(r.id, 'flagged', { flag_reason: 'Manual flag by admin' })}><Flag className="h-4 w-4 mr-2" />Flag</DropdownMenuItem>
                {r.status === 'flagged' && <DropdownMenuItem onClick={() => updateStatus(r.id, 'approved', { approved_at: new Date().toISOString(), flag_reason: null })}><CheckCircle2 className="h-4 w-4 mr-2" />Override Flag</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => { setEditDialog({ open: true, conversion: r }); setEditAmount(String(r.commission_amount)); }}><DollarSign className="h-4 w-4 mr-2" />Edit Commission</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )},
        ]}
        data={filtered}
        emptyState={{ title: 'No conversions yet' }}
      />

      <Dialog open={editDialog.open} onOpenChange={o => setEditDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Commission</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Commission Amount ($)</Label>
              <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} min="0" step="0.01" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false })}>Cancel</Button>
            <Button onClick={saveCommission}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
