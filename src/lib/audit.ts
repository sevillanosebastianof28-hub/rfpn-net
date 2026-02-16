import { supabase } from '@/integrations/supabase/client';

export async function logAudit(params: {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from('audit_logs').insert({
    user_id: session?.user?.id || null,
    user_email: session?.user?.email || null,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId || null,
    details: params.details || null,
  });
}
