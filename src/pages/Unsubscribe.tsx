import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

type Status = 'loading' | 'valid' | 'already_unsubscribed' | 'invalid' | 'success' | 'error';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid === false && data.reason === 'already_unsubscribed') setStatus('already_unsubscribed');
        else if (data.valid) setStatus('valid');
        else setStatus('invalid');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data } = await supabase.functions.invoke('handle-email-unsubscribe', { body: { token } });
      if (data?.success) setStatus('success');
      else if (data?.reason === 'already_unsubscribed') setStatus('already_unsubscribed');
      else setStatus('error');
    } catch { setStatus('error'); }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">RFPN</h1>

        {status === 'loading' && (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Verifying your request...</p>
          </div>
        )}

        {status === 'valid' && (
          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <AlertTriangle className="h-10 w-10 text-warning mx-auto" />
            <h2 className="text-lg font-semibold">Unsubscribe from emails?</h2>
            <p className="text-sm text-muted-foreground">
              You will no longer receive notification emails from RFPN. This action can't be undone.
            </p>
            <Button onClick={handleUnsubscribe} disabled={processing} className="w-full">
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Unsubscribe
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 p-6 rounded-lg border bg-card">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <h2 className="text-lg font-semibold">Unsubscribed</h2>
            <p className="text-sm text-muted-foreground">You have been successfully unsubscribed from RFPN emails.</p>
          </div>
        )}

        {status === 'already_unsubscribed' && (
          <div className="space-y-3 p-6 rounded-lg border bg-card">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold">Already Unsubscribed</h2>
            <p className="text-sm text-muted-foreground">You have already been unsubscribed from RFPN emails.</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-3 p-6 rounded-lg border bg-card">
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Invalid Link</h2>
            <p className="text-sm text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3 p-6 rounded-lg border bg-card">
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Something Went Wrong</h2>
            <p className="text-sm text-muted-foreground">Please try again later or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}
