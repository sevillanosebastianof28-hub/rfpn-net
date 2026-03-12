import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Rss, Send, Loader2, Image as ImageIcon, Trash2, Smile, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_name?: string;
  author_avatar?: string | null;
}

// Validate no external URLs
function containsExternalUrl(text: string): boolean {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  return urlRegex.test(text);
}

const EMOJI_LIST = ['👍', '❤️', '🔥', '🏗️', '🏠', '💰', '📈', '🎉', '👏', '💪', '🙌', '✅', '⭐', '🚀', '💎', '🤝', '📊', '🔑', '🏆', '💡'];

export default function SocialFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const { data } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) {
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name, avatar_url').in('user_id', authorIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, { name: `${p.first_name} ${p.last_name}`, avatar: p.avatar_url }]));
      setPosts(data.map(p => ({
        ...p,
        author_name: profileMap.get(p.author_id)?.name || 'Unknown',
        author_avatar: profileMap.get(p.author_id)?.avatar || null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Only images and videos are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if ((!newPost.trim() && !imageFile) || !user) return;
    if (containsExternalUrl(newPost)) {
      toast.error('External links are not allowed in posts.');
      return;
    }
    setPosting(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const path = `${user.id}/${Date.now()}-${imageFile.name}`;
      const { error } = await supabase.storage.from('social-media').upload(path, imageFile);
      if (error) { toast.error('Image upload failed'); setPosting(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('social-media').getPublicUrl(path);
      imageUrl = publicUrl;
    }

    await supabase.from('social_posts').insert({
      author_id: user.id,
      content: newPost.trim(),
      image_url: imageUrl,
      tenant_id: user.tenantId,
    });
    setNewPost('');
    clearImage();
    toast.success('Post shared!');
    fetchPosts();
    setPosting(false);
  };

  const handleDelete = async (postId: string) => {
    await supabase.from('social_posts').delete().eq('id', postId);
    toast.success('Post deleted');
    fetchPosts();
  };

  const addEmoji = (emoji: string) => {
    setNewPost(prev => prev + emoji);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <PageHeader title="Community Feed" description="Share updates with the network" />

      {/* New Post */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-primary">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            )}
          </div>
          <div className="flex-1">
            <Textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share a project update, milestone, or achievement..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mt-3 inline-block">
            {imageFile?.type.startsWith('video/') ? (
              <video src={imagePreview} className="max-h-48 rounded-lg" controls />
            ) : (
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-cover" />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={clearImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleImageSelect}
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-1" /> Photo/Video
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Smile className="h-4 w-4 mr-1" /> Emoji
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="grid grid-cols-5 gap-1">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="gradient" onClick={handlePost} disabled={posting || (!newPost.trim() && !imageFile)} size="sm">
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Post</>}
          </Button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Rss className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        {post.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{post.author_name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(post.created_at), 'MMM d, yyyy • HH:mm')}</p>
                  </div>
                </div>
                {post.author_id === user?.id && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
              {post.content && <p className="text-sm whitespace-pre-wrap mb-2">{post.content}</p>}
              {post.image_url && (
                post.image_url.match(/\.(mp4|webm|mov)/) ? (
                  <video src={post.image_url} className="mt-2 rounded-lg max-h-96 w-full object-cover" controls />
                ) : (
                  <img src={post.image_url} alt="" className="mt-2 rounded-lg max-h-96 w-full object-cover" />
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
