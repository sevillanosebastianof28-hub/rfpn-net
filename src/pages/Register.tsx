import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    const result = await register(form.email, form.password, form.firstName, form.lastName);
    
    if (result.success) {
      setRegistered(true);
      toast.success('Registration successful! Please check your email to verify your account.');
    } else {
      setError(result.error || 'Registration failed');
    }
    setIsSubmitting(false);
  };

  if (registered) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <Logo size="lg" />
          <div className="mt-8 glass-card rounded-2xl border border-border/50 p-8">
            <h1 className="text-2xl font-bold text-gradient mb-4">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <strong>{form.email}</strong>. Please click the link to verify your account before signing in.
            </p>
            <Link to="/login">
              <Button variant="gradient" className="w-full">Go to Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl float" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl float-delayed" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Link to="/" className="absolute top-6 left-6 z-10">
          <Button variant="ghost" size="sm" className="group gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>

        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex justify-center">
            <Link to="/"><Logo size="lg" /></Link>
          </div>

          <div className="glass-card rounded-2xl border border-border/50 p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gradient">Create Account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Register as a property developer</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} maxLength={100} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={c => setTermsAccepted(!!c)} />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I accept the <span className="text-primary cursor-pointer">Terms & Conditions</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /><p>{error}</p>
                </div>
              )}

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
