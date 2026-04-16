import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PoundSterling, Loader2 } from 'lucide-react';

export default function AffiliateSettings() {
  const { user } = useAuth();
  const [payoutPerLead, setPayoutPerLead] = useState('100');
  const [currency, setCurrency] = useState('GBP');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('affiliate_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (data) {
        setSettingsId(data.id);
        setPayoutPerLead(String(data.payout_per_lead));
        setCurrency(data.currency);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const value = parseFloat(payoutPerLead);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid payout amount');
      setSaving(false);
      return;
    }

    if (settingsId) {
      const { error } = await supabase
        .from('affiliate_settings')
        .update({
          payout_per_lead: value,
          currency,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId);
      if (error) { toast.error('Failed to save'); setSaving(false); return; }
    } else {
      const { error } = await supabase
        .from('affiliate_settings')
        .insert({
          payout_per_lead: value,
          currency,
          updated_by: user?.id || null,
        });
      if (error) { toast.error('Failed to save'); setSaving(false); return; }
    }

    toast.success('Affiliate settings saved');
    setSaving(false);
  };

  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Affiliate Settings"
        description="Configure affiliate program payout rates and currency"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PoundSterling className="h-5 w-5 text-primary" />
            Lead Payout Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout">Payout per Qualified Lead ({currencySymbol})</Label>
              <Input
                id="payout"
                type="number"
                min="0"
                step="0.01"
                value={payoutPerLead}
                onChange={e => setPayoutPerLead(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              When a lead is marked as <strong>Qualified</strong>, the affiliate will earn{' '}
              <strong>{currencySymbol}{parseFloat(payoutPerLead || '0').toFixed(2)}</strong> per lead.
              Historical leads retain their original payout value.
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
