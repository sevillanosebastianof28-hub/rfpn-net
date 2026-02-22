import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, Camera } from 'lucide-react';

export default function BrokerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('avatar_url, banner_url, bio, phone').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setBannerUrl((data as any).banner_url || null);
          setBio((data as any).bio || '');
          setPhone(data.phone || '');
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ bio, banner_url: bannerUrl, phone } as any).eq('user_id', user.id);
    toast.success('Profile saved');
    setSaving(false);
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

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

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

      <div className="px-6 mt-4 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people about your experience and expertise..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44..." />
          </div>
          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
