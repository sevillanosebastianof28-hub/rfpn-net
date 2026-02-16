import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
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
  const pendingApps = apps.filter(a => ['submitted', 'under_review', 'info_requested'].includes(a.status)).length;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Welcome, ${user?.firstName}`} description="Your developer dashboard" />

      {needsVerification && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Verification Required</h3>
            <p className="text-sm text-muted-foreground mb-2">Complete identity verification to access all features and submit applications.</p>
            <Link to="/developer/profile"><Button size="sm" variant="outline">Complete Verification</Button></Link>
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Applications" value={totalApps} icon={FileText} />
        <StatCard title="Pending Review" value={pendingApps} icon={Clock} />
        <StatCard title="Verification" value={devProfile?.verification_status === 'passed' ? 'Verified' : 'Pending'} icon={CheckCircle2} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Applications</h2>
        <Link to="/developer/applications"><Button variant="gradient" size="sm"><Plus className="h-4 w-4 mr-1" /> New Application</Button></Link>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No applications yet. Start your first funding application.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:border-primary/20 transition-colors">
              <div>
                <p className="font-medium">{app.title}</p>
                <p className="text-sm text-muted-foreground">{app.type} • {app.amount ? `£${Number(app.amount).toLocaleString()}` : 'TBD'}</p>
              </div>
              <StatusBadge status={app.status as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
