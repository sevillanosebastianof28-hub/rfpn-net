import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Save, Camera, Building2, User, Briefcase } from 'lucide-react';

export default function BrokerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Business fields (stored in bio as JSON or separate fields)
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [specializations, setSpecializations] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setBannerUrl(data.banner_url || null);
          setBio(data.bio || '');
          setPhone(data.phone || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      bio,
      banner_url: bannerUrl,
      phone,
      first_name: firstName,
      last_name: lastName,
    }).eq('user_id', user.id);
    if (error) toast.error('Failed to save');
    else toast.success('Profile saved');
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
    await supabase.from('profiles').update({ banner_url: publicUrl }).eq('user_id', user.id);
    setBannerUrl(publicUrl);
    toast.success('Banner updated');
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Banner */}
      <div className="relative h-48 rounded-t-xl bg-gradient-to-r from-primary/30 to-accent/20 overflow-hidden group">
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
          <h2 className="text-xl font-bold">{firstName || user?.firstName} {lastName || user?.lastName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email} • Broker</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="px-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="business"><Briefcase className="h-4 w-4 mr-1" /> Business</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people about your experience and expertise as a broker..." rows={4} />
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
        </TabsContent>

        <TabsContent value="business" className="space-y-6 mt-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Add your business details so developers and partners can find and connect with you.</p>
            <div className="space-y-2">
              <Label>Company / Brokerage Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Smith Finance Ltd" />
            </div>
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Textarea value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Full business address" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Specializations</Label>
              <Textarea value={specializations} onChange={e => setSpecializations(e.target.value)} placeholder="e.g. Development finance, bridging loans, commercial mortgages..." rows={3} />
            </div>
            <div className="flex justify-end">
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Business Info
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
