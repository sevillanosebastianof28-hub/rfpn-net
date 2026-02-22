import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Save, Upload, ShieldCheck, AlertTriangle, Camera, Eye, Trash2, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DevProfile = Database['public']['Tables']['developer_profiles']['Row'];
type DocRow = Database['public']['Tables']['documents']['Row'];

export default function DeveloperProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DevProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [form, setForm] = useState({
    company_name: '', company_registration_number: '', company_address: '',
    years_experience: 0,
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('avatar_url, banner_url, bio').eq('user_id', user.id).maybeSingle(),
    ]).then(([devRes, profileRes]) => {
      if (devRes.data) {
        setProfile(devRes.data);
        setForm({
          company_name: devRes.data.company_name || '',
          company_registration_number: devRes.data.company_registration_number || '',
          company_address: devRes.data.company_address || '',
          years_experience: devRes.data.years_experience || 0,
        });
      }
      if (profileRes.data) {
        setAvatarUrl(profileRes.data.avatar_url);
        setBannerUrl((profileRes.data as any).banner_url || null);
        setBio((profileRes.data as any).bio || '');
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    // Save dev profile
    if (profile) {
      await supabase.from('developer_profiles').update(form).eq('user_id', user.id);
    } else {
      await supabase.from('developer_profiles').insert({ user_id: user.id, ...form });
    }
    // Save bio/banner on profiles
    await supabase.from('profiles').update({ bio, banner_url: bannerUrl } as any).eq('user_id', user.id);
    toast.success('Profile saved');
    setSaving(false);
    const { data } = await supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle();
    setProfile(data);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload failed'); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
    setAvatarUrl(publicUrl);
    toast.success('Profile picture updated');
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/banner-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload failed'); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ banner_url: publicUrl } as any).eq('user_id', user.id);
    setBannerUrl(publicUrl);
    toast.success('Banner updated');
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
      if (res.error) { toast.error(res.error.message || 'Verification request failed'); return; }
      toast.success('Verification invite sent! Check your email.');
      const { data } = await supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(data);
    } catch (err: any) {
      toast.error(err.message || 'Verification request failed');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const verificationStatus = profile?.verification_status || 'not_started';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative h-48 rounded-t-xl bg-gradient-to-r from-primary/30 to-primary-glow/20 overflow-hidden group">
        {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-full object-cover" />}
        <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors cursor-pointer">
          <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
        </label>
      </div>

      {/* Avatar + Name */}
      <div className="relative px-6 pb-4 -mt-12 flex items-end gap-4">
        <div className="relative group">
          <div className="h-24 w-24 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> :
              <span className="text-2xl font-bold text-primary">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>}
          </div>
          <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer">
            <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </label>
        </div>
        <div className="pb-1">
          <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="px-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people about yourself and your projects..." rows={4} />
            </div>
            <div className="flex justify-end">
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-6 mt-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
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
            <div className="flex justify-end">
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Upload className="h-5 w-5" /> Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload your CV, project history, credit files, and identification documents.</p>
            <DocumentUploader userId={user?.id || ''} />
          </div>
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <div className={`rounded-xl border p-6 flex items-start gap-3 ${verificationStatus === 'passed' ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentUploader({ userId }: { userId: string }) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewDoc, setViewDoc] = useState<DocRow | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  const fetchDocs = () => {
    supabase.from('documents').select('*').eq('owner_id', userId).eq('profile_link', true)
      .then(({ data }) => setDocs(data || []));
  };

  useEffect(() => { fetchDocs(); }, [userId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) { toast.error('File type not allowed. Please upload PDF, DOCX, JPG, or PNG.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Maximum 10MB.'); return; }
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error('Upload failed'); setUploading(false); return; }
    await supabase.from('documents').insert({
      owner_id: userId, file_name: file.name, file_type: file.type,
      file_size: file.size, storage_path: path, document_type: 'profile', profile_link: true,
    });
    toast.success('Document uploaded');
    fetchDocs();
    setUploading(false);
  };

  const handleView = async (doc: DocRow) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
    if (data?.signedUrl) { setViewDoc(doc); setViewUrl(data.signedUrl); }
    else toast.error('Could not load document');
  };

  const handleDelete = async (doc: DocRow) => {
    await supabase.storage.from('documents').remove([doc.storage_path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    toast.success('Document deleted');
    fetchDocs();
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
              <span className="truncate flex-1">{doc.file_name}</span>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-muted-foreground whitespace-nowrap">{(doc.file_size / 1024).toFixed(0)} KB</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(doc)}><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(doc)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!viewDoc} onOpenChange={open => !open && setViewDoc(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {viewDoc?.file_name}
            </DialogTitle>
          </DialogHeader>
          {viewUrl && (
            viewDoc?.file_type.startsWith('image/') ?
              <img src={viewUrl} alt={viewDoc.file_name} className="max-h-[60vh] object-contain mx-auto rounded" /> :
              <iframe src={viewUrl} className="w-full h-[60vh] rounded border" title={viewDoc?.file_name} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
