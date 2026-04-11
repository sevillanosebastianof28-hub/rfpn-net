import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMultiple } from '@/hooks/useRealtime';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateBalance {
  id: string;
  affiliate_code: string;
  name: string;
  email: string;
  unpaidBalance: number;
  lastPaidAt: string | null;
  approvedConversionIds: string[];
}

export default function Payouts() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<AffiliateBalance[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payDialog, setPayDialog] = useState<{ open: boolean; affiliate?: AffiliateBalance }>({ open: false });
  const [payForm, setPayForm] = useState({ method: '', reference: '', note: '' });

  const [overviewStats, setOverviewStats] = useState({ totalUnpaid: 0, paidThisMonth: 0, totalPayouts: 0, pendingConversions: 0 });

  const fetchData = useCallback(async () => {
    const { data: affs } = await supabase.from('affiliates').select('*');
    if (!affs) { setLoading(false); return; }

    const enrichedBalances = await Promise.all(affs.map(async (a) => {
      const [profileRes, convsRes, payoutsRes] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email').eq('user_id', a.user_id).maybeSingle(),
        supabase.from('affiliate_conversions').select('*').eq('affiliate_id', a.id).eq('status', 'approved'),
        supabase.from('affiliate_payouts').select('*').eq('affiliate_id', a.id).order('created_at', { ascending: false }),
      ]);
      const unpaid = (convsRes.data || []).reduce((s, c) => s + Number(c.commission_amount), 0);
      const lastPayout = payoutsRes.data?.[0];
      return {
        id: a.id,
        affiliate_code: a.affiliate_code,
        name: profileRes.data ? `${profileRes.data.first_name} ${profileRes.data.last_name}` : '',
        email: profileRes.data?.email || '',
        unpaidBalance: unpaid,
        lastPaidAt: lastPayout?.created_at || null,
        approvedConversionIds: (convsRes.data || []).map(c => c.id),
      } as AffiliateBalance;
    }));

    setBalances(enrichedBalances);

    // All payouts
    const { data: allPayouts } = await supabase.from('affiliate_payouts').select('*').order('created_at', { ascending: false });
    setPayouts(allPayouts || []);

    // Pending conversions
    const { count: pendingCount } = await supabase.from('affiliate_conversions').select('id', { count: 'exact', head: true }).eq('status', 'pending');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const paidThisMonth = (allPayouts || []).filter(p => p.created_at >= monthStart).reduce((s, p) => s + Number(p.amount), 0);

    setOverviewStats({
      totalUnpaid: enrichedBalances.reduce((s, b) => s + b.unpaidBalance, 0),
      paidThisMonth,
      totalPayouts: (allPayouts || []).length,
      pendingConversions: pendingCount || 0,
    });

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeMultiple(['affiliate_conversions', 'affiliate_payouts'], fetchData);

  const processPayout = async () => {
    if (!payDialog.affiliate || !user) return;
    const aff = payDialog.affiliate;

    // Create payout record
    await supabase.from('affiliate_payouts').insert({
      affiliate_id: aff.id,
      amount: aff.unpaidBalance,
      method: payForm.method,
      transaction_reference: payForm.reference,
      note: payForm.note,
      processed_by_admin_id: user.id,
    });

    // Mark conversions as paid
    for (const cid of aff.approvedConversionIds) {
      await supabase.from('affiliate_conversions').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', cid);
    }

    toast.success(`Payout of $${aff.unpaidBalance.toFixed(2)} processed for ${aff.name}`);
    setPayDialog({ open: false });
    setPayForm({ method: '', reference: '', note: '' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" description="Manage affiliate payouts (mock workflow)" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Unpaid" value={`$${overviewStats.totalUnpaid.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Paid This Month" value={`$${overviewStats.paidThisMonth.toFixed(2)}`} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Total Payouts" value={overviewStats.totalPayouts} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Pending Conversions" value={overviewStats.pendingConversions} icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Affiliate Balances */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            isLoading={loading}
            columns={[
              { key: 'name', header: 'Affiliate', render: (r: AffiliateBalance) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
              { key: 'affiliate_code', header: 'Code', render: (r: AffiliateBalance) => <span className="font-mono text-xs">{r.affiliate_code}</span> },
              { key: 'unpaidBalance', header: 'Unpaid Balance', render: (r: AffiliateBalance) => <span className={r.unpaidBalance > 0 ? 'font-semibold text-teal' : ''}>${r.unpaidBalance.toFixed(2)}</span> },
              { key: 'lastPaidAt', header: 'Last Paid', render: (r: AffiliateBalance) => r.lastPaidAt ? new Date(r.lastPaidAt).toLocaleDateString() : 'Never' },
              { key: 'actions', header: '', render: (r: AffiliateBalance) => (
                <Button variant="outline" size="sm" disabled={r.unpaidBalance <= 0} onClick={() => setPayDialog({ open: true, affiliate: r })}>
                  Mark Paid
                </Button>
              )},
            ]}
            data={balances}
            emptyState={{ title: 'No affiliates with balances' }}
          />
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card>
        <CardContent className="p-0">
          <div className="p-5 border-b"><h3 className="font-semibold">Recent Payouts</h3></div>
          <DataTable
            columns={[
              { key: 'amount', header: 'Amount', render: (r: any) => `$${Number(r.amount).toFixed(2)}` },
              { key: 'method', header: 'Method', render: (r: any) => r.method || '—' },
              { key: 'transaction_reference', header: 'Reference', render: (r: any) => r.transaction_reference || '—' },
              { key: 'note', header: 'Note', render: (r: any) => r.note || '—' },
              { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
            ]}
            data={payouts}
            emptyState={{ title: 'No payouts processed yet' }}
          />
        </CardContent>
      </Card>

      {/* Payout Dialog */}
      <Dialog open={payDialog.open} onOpenChange={o => setPayDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
          </DialogHeader>
          {payDialog.affiliate && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-teal/10 p-4 text-center">
                <p className="text-sm text-muted-foreground">Paying {payDialog.affiliate.name}</p>
                <p className="text-2xl font-bold text-teal">${payDialog.affiliate.unpaidBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{payDialog.affiliate.approvedConversionIds.length} approved conversion(s)</p>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Input placeholder="e.g. Bank Transfer" value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Transaction Reference</Label>
                <Input placeholder="e.g. TXN-12345" value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Optional notes..." value={payForm.note} onChange={e => setPayForm({...payForm, note: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog({ open: false })}>Cancel</Button>
            <Button onClick={processPayout}>Confirm Payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
