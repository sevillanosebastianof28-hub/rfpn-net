import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
import { Loader2, Save, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DevProfile = Database['public']['Tables']['developer_profiles']['Row'];

export default function DeveloperProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DevProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '', company_registration_number: '', company_address: '',
    years_experience: 0,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({
            company_name: data.company_name || '',
            company_registration_number: data.company_registration_number || '',
            company_address: data.company_address || '',
            years_experience: data.years_experience || 0,
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    if (profile) {
      await supabase.from('developer_profiles').update(form).eq('user_id', user.id);
    } else {
      await supabase.from('developer_profiles').insert({ user_id: user.id, ...form });
    }

    toast.success('Profile saved');
    setSaving(false);
    // Refetch
    const { data } = await supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle();
    setProfile(data);
  };

  const handleRequestVerification = async () => {
    if (!user) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { toast.error('Please log in again'); return; }

      const res = await supabase.functions.invoke('credas-verify', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.error) {
        toast.error(res.error.message || 'Verification request failed');
        return;
      }

      toast.success('Verification invite sent! Check your email for the Credas link.');
      const { data } = await supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(data);
    } catch (err: any) {
      toast.error(err.message || 'Verification request failed');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const verificationStatus = profile?.verification_status || 'not_started';

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader title="Developer Profile" description="Your reusable profile for credit applications" />

      {/* Verification Status */}
      <div className={`mb-6 rounded-xl border p-4 flex items-start gap-3 ${verificationStatus === 'passed' ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
        {verificationStatus === 'passed' ? <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Identity Verification</h3>
            <StatusBadge status={verificationStatus === 'passed' ? 'verified' : verificationStatus === 'in_progress' ? 'pending' : 'unverified'} type="verification" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {verificationStatus === 'passed' ? 'Your identity has been verified.' :
             verificationStatus === 'in_progress' ? 'Verification is being processed.' :
             'Complete verification to submit applications.'}
          </p>
          {verificationStatus === 'not_started' && (
            <Button size="sm" className="mt-2" onClick={handleRequestVerification}>Start Verification</Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input value={form.company_registration_number} onChange={e => setForm({...form, company_registration_number: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Company Address</Label>
          <Textarea value={form.company_address} onChange={e => setForm({...form, company_address: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Years of Experience</Label>
          <Input type="number" min={0} value={form.years_experience} onChange={e => setForm({...form, years_experience: parseInt(e.target.value) || 0})} />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="gradient" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save Profile
          </Button>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Upload className="h-5 w-5" /> Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">Upload your CV, project history, credit files, and identification documents.</p>
        <DocumentUploader userId={user?.id || ''} />
      </div>
    </div>
  );
}

function DocumentUploader({ userId }: { userId: string }) {
  const [docs, setDocs] = useState<Database['public']['Tables']['documents']['Row'][]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from('documents').select('*').eq('owner_id', userId).eq('profile_link', true).then(({ data }) => setDocs(data || []));
  }, [userId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not allowed. Please upload PDF, DOCX, JPG, or PNG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB.');
      return;
    }

    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error('Upload failed'); setUploading(false); return; }

    await supabase.from('documents').insert({
      owner_id: userId, file_name: file.name, file_type: file.type,
      file_size: file.size, storage_path: path, document_type: 'profile',
      profile_link: true,
    });

    toast.success('Document uploaded');
    const { data } = await supabase.from('documents').select('*').eq('owner_id', userId).eq('profile_link', true);
    setDocs(data || []);
    setUploading(false);
  };

  return (
    <div>
      <input type="file" id="doc-upload" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" />
      <label htmlFor="doc-upload">
        <Button variant="outline" asChild disabled={uploading}>
          <span>{uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Uploading...</> : <><Upload className="h-4 w-4 mr-1" /> Upload Document</>}</span>
        </Button>
      </label>
      {docs.length > 0 && (
        <div className="mt-4 space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
              <span>{doc.file_name}</span>
              <span className="text-muted-foreground">{(doc.file_size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
