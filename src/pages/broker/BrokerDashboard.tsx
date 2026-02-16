import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FileText, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('applications').select('*').eq('assigned_broker_id', user.id).order('updated_at', { ascending: false }).limit(10)
      .then(({ data }) => { setApps(data || []); setLoading(false); });
  }, [user]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const active = apps.filter(a => !['completed', 'declined'].includes(a.status)).length;
  const completed = apps.filter(a => a.status === 'completed').length;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Welcome, ${user?.firstName}`} description="Your broker dashboard" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Assigned Applications" value={apps.length} icon={FileText} />
        <StatCard title="Active" value={active} icon={Clock} />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} />
      </div>
      <h2 className="text-lg font-semibold mb-4">Recent Assigned Applications</h2>
      {apps.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No applications assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{app.title}</p>
                <p className="text-sm text-muted-foreground">{app.type} • {format(new Date(app.updated_at), 'MMM d, yyyy')}</p>
              </div>
              <StatusBadge status={app.status as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
