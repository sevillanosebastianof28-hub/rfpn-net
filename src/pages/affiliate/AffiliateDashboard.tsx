import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMultiple } from '@/hooks/useRealtime';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MousePointer, Users, FileText, DollarSign, Clock, CheckCircle2, Copy } from 'lucide-react';

interface AffiliateData {
  id: string;
  affiliate_code: string;
  custom_slug: string | null;
  status: string;
}

interface Stats {
  clicks: number;
  signups: number;
  applications: number;
  pending: number;
  approved: number;
  paid: number;
  totalEarned: number;
  totalPaid: number;
  unpaidBalance: number;
}

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<Stats>({ clicks: 0, signups: 0, applications: 0, pending: 0, approved: 0, paid: 0, totalEarned: 0, totalPaid: 0, unpaidBalance: 0 });
  const [conversions, setConversions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: aff } = await supabase.from('affiliates').select('*').eq('user_id', user.id).maybeSingle();
    if (!aff) { setLoading(false); return; }
    setAffiliate(aff as AffiliateData);

    const [clicksRes, signupsRes, conversionsRes, payoutsRes] = await Promise.all([
      supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('affiliate_id', aff.id),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by_affiliate_id', aff.id),
      supabase.from('affiliate_conversions').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_payouts').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
    ]);

    const convs = conversionsRes.data || [];
    setConversions(convs);
    setPayouts(payoutsRes.data || []);

    const pending = convs.filter(c => c.status === 'pending').length;
    const approved = convs.filter(c => c.status === 'approved').length;
    const paid = convs.filter(c => c.status === 'paid').length;
    const totalEarned = convs.filter(c => ['approved', 'paid'].includes(c.status)).reduce((s, c) => s + Number(c.commission_amount), 0);
    const totalPaid = (payoutsRes.data || []).reduce((s, p) => s + Number(p.amount), 0);

    setStats({
      clicks: clicksRes.count || 0,
      signups: signupsRes.count || 0,
      applications: convs.length,
      pending, approved, paid,
      totalEarned,
      totalPaid,
      unpaidBalance: totalEarned - totalPaid,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeMultiple(['affiliate_clicks', 'affiliate_conversions', 'affiliate_payouts'], fetchData);

  const referralLink = affiliate ? `https://rfpn.net/?ref=${affiliate.custom_slug || affiliate.affiliate_code}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  if (loading) return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!affiliate) return <div className="p-8 text-center text-muted-foreground">No affiliate account found.</div>;

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <Card className="border-teal/20 bg-teal/5">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Your Referral Link</p>
            <p className="text-sm font-mono text-foreground mt-1 break-all">{referralLink}</p>
          </div>
          <Button onClick={copyLink} variant="outline" size="sm" className="shrink-0 gap-2">
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Clicks" value={stats.clicks} icon={<MousePointer className="h-5 w-5" />} />
        <StatCard title="Signups" value={stats.signups} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Applications" value={stats.applications} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Earned</p><p className="text-2xl font-bold text-foreground">${stats.totalEarned.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-2xl font-bold text-foreground">${stats.totalPaid.toFixed(2)}</p></CardContent></Card>
        <Card className="border-teal/20"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Unpaid Balance</p><p className="text-2xl font-bold text-teal">${stats.unpaidBalance.toFixed(2)}</p></CardContent></Card>
      </div>

      {/* Conversions */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversion History</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'application_id', header: 'Application', render: (r: any) => <span className="font-mono text-xs">{r.application_id?.slice(0, 8) || '—'}...</span> },
              { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'commission_amount', header: 'Commission', render: (r: any) => `$${Number(r.commission_amount).toFixed(2)}` },
              { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
            ]}
            data={conversions}
            emptyState={{ title: 'No conversions yet', description: 'Share your referral link to start earning.' }}
          />
        </CardContent>
      </Card>

      {/* Payouts */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Payout History</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'amount', header: 'Amount', render: (r: any) => `$${Number(r.amount).toFixed(2)}` },
              { key: 'method', header: 'Method', render: (r: any) => r.method || '—' },
              { key: 'transaction_reference', header: 'Reference', render: (r: any) => r.transaction_reference || '—' },
              { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
            ]}
            data={payouts}
            emptyState={{ title: 'No payouts yet', description: 'Payouts appear here once processed by admin.' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
