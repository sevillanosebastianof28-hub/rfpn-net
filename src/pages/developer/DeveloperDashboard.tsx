import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import {
  FileText, Plus, Clock, AlertTriangle, CheckCircle2, Loader2,
  ArrowRight, TrendingUp, Building2, ShieldCheck
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];
type DevProfile = Database['public']['Tables']['developer_profiles']['Row'];

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [devProfile, setDevProfile] = useState<DevProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('applications').select('*').eq('developer_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ]).then(([appsRes, devRes]) => {
      setApps(appsRes.data || []);
      setDevProfile(devRes.data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const needsVerification = !devProfile || devProfile.verification_status !== 'passed';
  const totalApps = apps.length;
  const drafts = apps.filter(a => a.status === 'draft').length;
  const pendingApps = apps.filter(a => ['submitted', 'under_review', 'info_requested'].includes(a.status)).length;
  const approved = apps.filter(a => a.status === 'approved').length;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary-glow/80 p-8 text-primary-foreground">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName} 👋</h1>
          <p className="text-primary-foreground/80 text-lg">Here's an overview of your funding applications and profile status.</p>
          <div className="mt-6">
            <Link to="/developer/applications/new">
              <Button variant="secondary" size="lg" className="group">
                <Plus className="h-5 w-5 mr-2" />
                Start New Application
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Alert */}
      {needsVerification && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-full bg-warning/15 p-2.5">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Identity Verification Required</h3>
              <p className="text-sm text-muted-foreground mt-1">Complete your KYC verification to unlock full access and submit applications.</p>
            </div>
            <Link to="/developer/profile">
              <Button size="sm" variant="outline" className="shrink-0">
                <ShieldCheck className="h-4 w-4 mr-1" /> Verify Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Applications', value: totalApps, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Drafts', value: drafts, icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
          { title: 'Pending Review', value: pendingApps, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { title: 'Approved', value: approved, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat) => (
          <Card key={stat.title} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className={`rounded-xl ${stat.bg} p-2.5 transition-colors group-hover:scale-110 duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Recent Applications
          </h2>
          <Link to="/developer/applications">
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {apps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No applications yet</h3>
              <p className="text-muted-foreground mb-4">Start your first funding application to get going.</p>
              <Link to="/developer/applications/new">
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-1" /> Create Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {apps.map((app, i) => (
              <Link key={app.id} to={`/developer/applications/${app.id}`}>
                <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{app.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.type.replace(/_/g, ' ')} • {app.amount ? `£${Number(app.amount).toLocaleString()}` : 'Amount TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status as any} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
