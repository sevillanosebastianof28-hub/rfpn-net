import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { FileText, Clock, CheckCircle2, Loader2, MessageSquare, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadCount, setThreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('applications').select('*').or(`assigned_broker_id.eq.${user.id},broker_email.eq.${user.email}`).order('updated_at', { ascending: false }).limit(10),
      supabase.from('message_thread_participants').select('thread_id').eq('user_id', user.id),
    ]).then(([appsRes, threadsRes]) => {
      setApps(appsRes.data || []);
      setThreadCount(threadsRes.data?.length || 0);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const active = apps.filter(a => !['completed', 'declined'].includes(a.status)).length;
  const allocated = apps.filter(a => a.status === 'allocated').length;
  const completed = apps.filter(a => a.status === 'completed').length;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Welcome, ${user?.firstName}`} description="Your broker dashboard — manage applications, communicate with developers" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Applications" value={apps.length} icon={FileText} href="/broker/applications" />
        <StatCard title="Active" value={active} icon={Clock} href="/broker/applications" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} />
        <StatCard title="Conversations" value={threadCount} icon={MessageSquare} href="/broker/messages" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Assigned Applications</h2>
        <Link to="/broker/applications">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </div>
      {apps.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No applications assigned yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Applications will appear here once an admin assigns them to you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <Link key={app.id} to={`/broker/applications/${app.id}`} className="block">
              <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-medium">{app.title}</p>
                  <p className="text-sm text-muted-foreground">{app.type} • {format(new Date(app.updated_at), 'MMM d, yyyy')}</p>
                  {app.amount && <p className="text-sm font-medium text-primary mt-1">£{Number(app.amount).toLocaleString()}</p>}
                </div>
                <StatusBadge status={app.status as any} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
