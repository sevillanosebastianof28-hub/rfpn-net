import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TableName = 'affiliates' | 'affiliate_clicks' | 'affiliate_conversions' | 'affiliate_payouts' | 'affiliate_settings' | 'affiliate_withdrawal_requests';

export function useRealtimeTable(table: TableName, onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onUpdate();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, onUpdate]);
}

export function useRealtimeMultiple(tables: TableName[], onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase.channel('realtime-affiliate-multi');
    tables.forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onUpdate();
      });
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tables.join(','), onUpdate]);
}
