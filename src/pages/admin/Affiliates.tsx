import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, UserCheck, UserX, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateRow {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: string;
  created_at: string;
  profile?: { first_name: string; last_name: string; email: string };
  clickCount: number;
  signupCount: number;
  conversionCount: number;
  pendingCount: number;
  approvedCount: number;
  totalEarned: number;
  totalPaid: number;
}

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAffiliates = useCallback(async () => {
    const { data: affs } = await supabase.from('affiliates').select('*');
    if (!affs) { setLoading(false); return; }

    const enriched = await Promise.all(affs.map(async (a) => {
      const [profileRes, clicksRes, signupsRes, convsRes, payoutsRes] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email').eq('user_id', a.user_id).maybeSingle(),
        supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('affiliate_id', a.id),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by_affiliate_id', a.id),
        supabase.from('affiliate_conversions').select('*').eq('affiliate_id', a.id),
        supabase.from('affiliate_payouts').select('amount').eq('affiliate_id', a.id),
      ]);

      const convs = convsRes.data || [];
      return {
        ...a,
        profile: profileRes.data || undefined,
        clickCount: clicksRes.count || 0,
        signupCount: signupsRes.count || 0,
        conversionCount: convs.length,
        pendingCount: convs.filter(c => c.status === 'pending').length,
        approvedCount: convs.filter(c => ['approved', 'paid'].includes(c.status)).length,
        totalEarned: convs.filter(c => ['approved', 'paid'].includes(c.status)).reduce((s, c) => s + Number(c.commission_amount), 0),
        totalPaid: (payoutsRes.data || []).reduce((s, p) => s + Number(p.amount), 0),
      } as AffiliateRow;
    }));

    setAffiliates(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAffiliates(); }, [fetchAffiliates]);
  useRealtimeTable('affiliates', fetchAffiliates);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('affiliates').update({ status }).eq('id', id);
    toast.success(`Affiliate ${status}`);
    fetchAffiliates();
  };

  const filtered = affiliates.filter(a => {
    const name = `${a.profile?.first_name} ${a.profile?.last_name} ${a.affiliate_code}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliates" description="Manage affiliate partners" />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search affiliates..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        isLoading={loading}
        columns={[
          { key: 'name', header: 'Name', render: (r: AffiliateRow) => <div><p className="font-medium">{r.profile?.first_name} {r.profile?.last_name}</p><p className="text-xs text-muted-foreground">{r.profile?.email}</p></div> },
          { key: 'affiliate_code', header: 'Code', render: (r: AffiliateRow) => <span className="font-mono text-xs">{r.affiliate_code}</span> },
          { key: 'clickCount', header: 'Clicks', render: (r: AffiliateRow) => r.clickCount },
          { key: 'signupCount', header: 'Signups', render: (r: AffiliateRow) => r.signupCount },
          { key: 'conversionCount', header: 'Apps', render: (r: AffiliateRow) => r.conversionCount },
          { key: 'pendingCount', header: 'Pending', render: (r: AffiliateRow) => r.pendingCount },
          { key: 'approvedCount', header: 'Approved', render: (r: AffiliateRow) => r.approvedCount },
          { key: 'totalEarned', header: 'Earned', render: (r: AffiliateRow) => `$${r.totalEarned.toFixed(2)}` },
          { key: 'totalPaid', header: 'Paid', render: (r: AffiliateRow) => `$${r.totalPaid.toFixed(2)}` },
          { key: 'status', header: 'Status', render: (r: AffiliateRow) => <StatusBadge status={r.status} /> },
          { key: 'actions', header: '', render: (r: AffiliateRow) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus(r.id, 'active')}><UserCheck className="h-4 w-4 mr-2" />Activate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(r.id, 'inactive')}><UserX className="h-4 w-4 mr-2" />Deactivate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(r.id, 'banned')} className="text-destructive"><Ban className="h-4 w-4 mr-2" />Ban</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )},
        ]}
        data={filtered}
        emptyState={{ title: 'No affiliates yet' }}
      />
    </div>
  );
}
