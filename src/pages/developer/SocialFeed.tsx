import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Rss, Send, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_name?: string;
}

// Validate no external URLs
function containsExternalUrl(text: string): boolean {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  return urlRegex.test(text);
}

export default function SocialFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchPosts = async () => {
    const { data } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) {
      // Fetch author profiles
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', authorIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, `${p.first_name} ${p.last_name}`]));
      setPosts(data.map(p => ({ ...p, author_name: profileMap.get(p.author_id) || 'Unknown' })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    if (containsExternalUrl(newPost)) {
      toast.error('External links are not allowed in posts.');
      return;
    }
    setPosting(true);
    await supabase.from('social_posts').insert({ author_id: user.id, content: newPost.trim(), tenant_id: user.tenantId });
    setNewPost('');
    toast.success('Post shared!');
    fetchPosts();
    setPosting(false);
  };

  const handleDelete = async (postId: string) => {
    await supabase.from('social_posts').delete().eq('id', postId);
    toast.success('Post deleted');
    fetchPosts();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <PageHeader title="Community Feed" description="Share updates with the developer community" />

      {/* New Post */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <Textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share a project update, milestone, or achievement..." rows={3} />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-muted-foreground">No external links allowed</p>
          <Button variant="gradient" onClick={handlePost} disabled={posting || !newPost.trim()} size="sm">
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
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {post.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
              {post.image_url && <img src={post.image_url} alt="" className="mt-3 rounded-lg max-h-64 object-cover" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
