import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, ArrowLeft, DollarSign, Link2, BarChart3, Users } from 'lucide-react';
import { toast } from 'sonner';

const benefits = [
  { icon: DollarSign, title: '$50 Per Approved Application', desc: 'Earn commission for every approved funding application.' },
  { icon: Link2, title: 'Unique Referral Link', desc: 'Get your own trackable referral link to share.' },
  { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'Track clicks, signups, and earnings in real time.' },
  { icon: Users, title: '30-Day Cookie Window', desc: 'Referrals are attributed for 30 days after the initial click.' },
];

export default function AffiliateSignup() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', payoutMethod: '', payoutDetails: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'affiliate') {
      navigate('/affiliate/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!agreed) { setError('You must agree to the affiliate terms'); return; }

    setLoading(true);

    // Sign up directly with Supabase to get the user immediately
    const { error, data } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { first_name: form.firstName, last_name: form.lastName, role: 'affiliate' },
      },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const code = `${form.firstName.toLowerCase().replace(/\W/g, '')}${Math.random().toString(36).slice(2, 8)}`;
      const { error: affError } = await supabase.from('affiliates').upsert({
        user_id: data.user.id,
        affiliate_code: code,
        payout_details: { method: form.payoutMethod, details: form.payoutDetails },
        status: 'active',
      }, { onConflict: 'user_id' });

      if (affError) {
        setError('Your account was created, but we could not finish setting up the affiliate profile. Please sign in once and try again.');
        setLoading(false);
        return;
      }
    }

    toast.success('Affiliate account created. Preparing your dashboard...');
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
        </div>

        {/* Hero */}
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal mb-6">
            <DollarSign className="h-4 w-4" /> Affiliate Program
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Earn With <span className="text-gradient">RFPN</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Refer property developers to RFPN and earn $50 for every approved funding application. Track everything in real time.
          </p>
        </div>

        {/* Benefits */}
        <div className="mx-auto max-w-4xl px-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {benefits.map(b => (
            <Card key={b.title} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-lg bg-teal/10 p-2.5"><b.icon className="h-5 w-5 text-teal" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Signup Form */}
        <div className="mx-auto max-w-md px-4 pb-16">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-center mb-1">Join the Program</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Create your affiliate account</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Payout Method</Label>
                  <Input placeholder="e.g. Bank Transfer, PayPal" value={form.payoutMethod} onChange={e => setForm({...form, payoutMethod: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Payout Details</Label>
                  <Input placeholder="Account details (mock)" value={form.payoutDetails} onChange={e => setForm({...form, payoutDetails: e.target.value})} />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="agree" checked={agreed} onCheckedChange={c => setAgreed(!!c)} className="mt-0.5" />
                  <label htmlFor="agree" className="text-sm text-muted-foreground">
                    I agree to the <span className="text-primary cursor-pointer">Affiliate Terms & Conditions</span> and understand commissions are paid upon admin approval.
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" /><p>{error}</p>
                  </div>
                )}

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your affiliate workspace...</> : 'Join Affiliate Program'}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already an affiliate? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
