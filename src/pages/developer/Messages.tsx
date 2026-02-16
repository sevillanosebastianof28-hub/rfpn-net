import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Thread {
  id: string;
  subject: string | null;
  application_id: string | null;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('message_thread_participants').select('thread_id').eq('user_id', user.id)
      .then(async ({ data: participants }) => {
        if (!participants?.length) { setLoading(false); return; }
        const threadIds = participants.map(p => p.thread_id);
        const { data: threadData } = await supabase.from('message_threads').select('*').in('id', threadIds).order('updated_at', { ascending: false });
        setThreads(threadData || []);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedThread) return;
    supabase.from('messages').select('*').eq('thread_id', selectedThread).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    // Realtime subscription
    const channel = supabase.channel(`messages-${selectedThread}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${selectedThread}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedThread]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return;
    setSending(true);
    await supabase.from('messages').insert({ thread_id: selectedThread, sender_id: user.id, content: newMessage.trim() });
    setNewMessage('');
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Messages" description="Communicate with brokers and admins" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Thread List */}
        <div className="rounded-xl border border-border bg-card overflow-y-auto">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : threads.map(t => (
            <button key={t.id} onClick={() => setSelectedThread(t.id)}
              className={cn('w-full p-4 text-left border-b border-border/50 hover:bg-muted/50 transition-colors', selectedThread === t.id && 'bg-primary/5')}>
              <p className="font-medium truncate">{t.subject || 'Untitled Thread'}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(t.updated_at), 'MMM d, HH:mm')}</p>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card flex flex-col">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground"><p>Select a conversation</p></div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={cn('max-w-[70%] rounded-xl p-3 text-sm', m.sender_id === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p>{m.content}</p>
                    <p className={cn('text-xs mt-1', m.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{format(new Date(m.created_at), 'HH:mm')}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-border p-3 flex gap-2">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..."
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
                <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
