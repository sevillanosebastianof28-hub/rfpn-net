import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';
import { toast } from 'sonner';
import {
  Copy, MousePointer, Users, FileText,
  CheckCircle2, ArrowDownToLine, PoundSterling, Search
} from 'lucide-react';

interface AffiliateData {
  id: string;
  affiliate_code: string;
  custom_slug: string | null;
  status: string;
}

interface AffiliateSettings {
  payout_per_lead: number;
  currency: string;
}

interface Stats {
  clicks: number;
  signups: number;
  totalLeads: number;
  qualifiedLeads: number;
  totalEarned: number;
  pendingEarnings: number;
  totalPaid: number;
  availableBalance: number;
}

export default function DeveloperAffiliate() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [settings, setSettings] = useState<AffiliateSettings>({ payout_per_lead: 100, currency: 'GBP' });
  const [stats, setStats] = useState<Stats>({ clicks: 0, signups: 0, totalLeads: 0, qualifiedLeads: 0, totalEarned: 0, pendingEarnings: 0, totalPaid: 0, availableBalance: 0 });
  const [conversions, setConversions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');

  const currencySymbol = settings.currency === 'GBP' ? '£' : settings.currency === 'EUR' ? '€' : '$';

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Fetch affiliate settings
    const { data: settingsData } = await supabase
      .from('affiliate_settings')
      .select('payout_per_lead, currency')
      .limit(1)
      .maybeSingle();
    if (settingsData) setSettings(settingsData);

    // Fetch affiliate record
    const { data: aff } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!aff) { setLoading(false); return; }
    setAffiliate(aff as AffiliateData);

    const [clicksRes, signupsRes, conversionsRes, payoutsRes, withdrawalsRes] = await Promise.all([
      supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('affiliate_id', aff.id),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by_affiliate_id', aff.id),
      supabase.from('affiliate_conversions').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_payouts').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
      supabase.from('affiliate_withdrawal_requests').select('*').eq('affiliate_id', aff.id).order('created_at', { ascending: false }),
    ]);

    const convs = conversionsRes.data || [];
    const pays = payoutsRes.data || [];
    setConversions(convs);
    setPayouts(pays);
    setWithdrawals(withdrawalsRes.data || []);

    const qualifiedStatuses = ['approved', 'paid'];
    const totalEarned = convs.filter(c => qualifiedStatuses.includes(c.status)).reduce((s: number, c: any) => s + Number(c.lead_payout_value || c.commission_amount), 0);
    const pendingEarnings = convs.filter(c => c.status === 'pending').reduce((s: number, c: any) => s + Number(c.lead_payout_value || c.commission_amount), 0);
    const totalPaid = pays.reduce((s: number, p: any) => s + Number(p.amount), 0);

    setStats({
      clicks: clicksRes.count || 0,
      signups: signupsRes.count || 0,
      totalLeads: convs.length,
      qualifiedLeads: convs.filter(c => qualifiedStatuses.includes(c.status)).length,
      totalEarned,
      pendingEarnings,
      totalPaid,
      availableBalance: totalEarned - totalPaid,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('dev-affiliate-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'affiliate_conversions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'affiliate_payouts' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'affiliate_withdrawal_requests' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'affiliate_settings' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const referralLink = affiliate ? `https://rfpn.net/?ref=${affiliate.custom_slug || affiliate.affiliate_code}` : '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleWithdraw = async () => {
    if (!affiliate) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > stats.availableBalance) {
      toast.error('Invalid withdrawal amount');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('affiliate_withdrawal_requests').insert({
      affiliate_id: affiliate.id,
      amount,
      payment_method: withdrawMethod,
      payment_details: { details: withdrawDetails },
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to submit request'); return; }
    toast.success('Withdrawal request submitted');
    setWithdrawOpen(false);
    setWithdrawAmount('');
    setWithdrawDetails('');
    fetchData();
  };

  const filteredConversions = conversions.filter(c => {
    if (leadStatusFilter !== 'all' && c.status !== leadStatusFilter) return false;
    if (leadSearch) {
      const searchLower = leadSearch.toLowerCase();
      const id = (c.id || '').toLowerCase();
      const appId = (c.application_id || '').toLowerCase();
      if (!id.includes(searchLower) && !appId.includes(searchLower)) return false;
    }
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  if (!affiliate) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Affiliate Account</h3>
            <p className="text-muted-foreground mb-4">You don't have an affiliate account yet. Sign up to start earning referral commissions.</p>
            <Button variant="gradient" onClick={() => window.open('/affiliate', '_blank')}>
              Become an Affiliate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Affiliate Overview Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Affiliate Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={affiliate.status as any} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Affiliate ID</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{affiliate.id.slice(0, 12)}...</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(affiliate.id, 'Affiliate ID')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referral Code</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{affiliate.affiliate_code}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(affiliate.affiliate_code, 'Referral code')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Referral Link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono break-all">{referralLink}</code>
              <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => copyToClipboard(referralLink, 'Referral link')}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </div>

          {/* Lead Price */}
          <div className="rounded-lg bg-accent/50 p-4 flex items-center gap-3">
            <PoundSterling className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Payout per Qualified Lead</p>
              <p className="text-xl font-bold">{currencySymbol}{settings.payout_per_lead.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Clicks" value={stats.clicks} icon={MousePointer} />
        <StatCard title="Signups" value={stats.signups} icon={Users} />
        <StatCard title="Total Leads" value={stats.totalLeads} icon={FileText} />
        <StatCard title="Qualified Leads" value={stats.qualifiedLeads} icon={CheckCircle2} />
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold">{currencySymbol}{stats.totalEarned.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Earnings</p>
            <p className="text-2xl font-bold text-warning">{currencySymbol}{stats.pendingEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Withdrawn</p>
            <p className="text-2xl font-bold">{currencySymbol}{stats.totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-primary">{currencySymbol}{stats.availableBalance.toFixed(2)}</p>
            </div>
            {stats.availableBalance > 0 && (
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="gradient" className="gap-2">
                    <ArrowDownToLine className="h-4 w-4" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Amount ({currencySymbol})</Label>
                      <Input
                        type="number"
                        max={stats.availableBalance}
                        min={1}
                        step="0.01"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder={`Max: ${currencySymbol}${stats.availableBalance.toFixed(2)}`}
                      />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Payment Details</Label>
                      <Textarea
                        placeholder="Enter your bank details, PayPal email, etc."
                        value={withdrawDetails}
                        onChange={e => setWithdrawDetails(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleWithdraw} disabled={submitting} className="w-full" variant="gradient">
                      {submitting ? 'Submitting...' : 'Confirm Withdrawal Request'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Affiliate Leads</CardTitle>
          <div className="flex items-center gap-3 mt-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ID..." className="pl-9" value={leadSearch} onChange={e => setLeadSearch(e.target.value)} />
            </div>
            <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Qualified</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'id', header: 'Lead ID', render: (r: any) => <span className="font-mono text-xs">{r.id?.slice(0, 8)}...</span> },
              { key: 'created_at', header: 'Date Submitted', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
              { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'lead_payout_value', header: 'Assigned Value', render: (r: any) => `${currencySymbol}${Number(r.lead_payout_value || r.commission_amount).toFixed(2)}` },
              { key: 'rejected_reason', header: 'Notes', render: (r: any) => r.rejected_reason || r.flag_reason || '—' },
            ]}
            data={filteredConversions}
            emptyState={{ title: 'No leads yet', description: 'Share your referral link to start generating leads.' }}
          />
        </CardContent>
      </Card>

      {/* Payout / Withdrawal History */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Withdrawal & Payout History</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'id', header: 'ID', render: (r: any) => <span className="font-mono text-xs">{r.id?.slice(0, 8)}...</span> },
              { key: 'created_at', header: 'Date Requested', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
              { key: 'approved_at', header: 'Date Approved', render: (r: any) => r.approved_at ? new Date(r.approved_at).toLocaleDateString() : '—' },
              { key: 'amount', header: 'Amount', render: (r: any) => `${currencySymbol}${Number(r.amount).toFixed(2)}` },
              { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
              { key: 'payment_method', header: 'Method', render: (r: any) => r.payment_method || r.method || '—' },
              { key: 'transaction_reference', header: 'Reference', render: (r: any) => r.transaction_reference || '—' },
            ]}
            data={[...withdrawals, ...payouts.map(p => ({ ...p, status: 'paid' }))]}
            emptyState={{ title: 'No payouts yet', description: 'Withdrawal requests will appear here.' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
