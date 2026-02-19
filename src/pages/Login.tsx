import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Role-based redirect when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'super_admin' || user.role === 'central_admin') navigate('/admin');
      else if (user.role === 'developer') navigate('/developer');
      else if (user.role === 'broker') navigate('/broker');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Invalid credentials');
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/8 blur-3xl float" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-teal/10 blur-3xl float-delayed" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/5 blur-3xl animate-pulse-slow" />
        <div className="absolute top-20 right-20 h-32 w-32 rounded-full border border-teal/15 float" />
        <div className="absolute bottom-32 left-20 h-24 w-24 rounded-full border border-rose/10 float-delayed" />
        <div className="absolute top-1/3 left-1/4 h-16 w-16 rounded-full bg-primary/8 float" />
      </div>

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(288 45% 38% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(288 45% 38% / 0.3) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }} />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Link to="/" className="absolute top-6 left-6 z-10 animate-fade-in">
          <Button variant="ghost" size="sm" className="group gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>

        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex justify-center animate-slide-up">
            <Link to="/"><Logo size="lg" /></Link>
          </div>

          <div className="glass-card hover-glow rounded-2xl border border-border/50 p-8 animate-slide-up stagger-1">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gradient">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to access your portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 animate-slide-in-left stagger-2" style={{ opacity: 0 }}>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="input-glow" />
              </div>
              <div className="space-y-2 animate-slide-in-left stagger-3" style={{ opacity: 0 }}>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="input-glow" />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" /><p>{error}</p>
                </div>
              )}

              <div className="animate-slide-up stagger-4" style={{ opacity: 0 }}>
                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
                </Button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account? <Link to="/register" className="text-primary hover:underline">Register as Developer</Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground animate-fade-in stagger-5" style={{ opacity: 0 }}>
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
