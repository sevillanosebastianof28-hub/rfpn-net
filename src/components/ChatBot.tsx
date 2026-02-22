import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [query, setQuery] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! I\'m here to help. Ask me anything about the platform.' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('faqs').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setFaqs(data || []));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const handleAsk = async (questionText: string) => {
    setMessages(prev => [...prev, { role: 'user', text: questionText }]);
    setQuery('');
    setThinking(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { question: questionText },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'I\'m having trouble connecting. Please try again shortly.' }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl animate-slide-up overflow-hidden">
          <div className="bg-primary p-4 text-primary-foreground flex items-center gap-3">
            <Bot className="h-6 w-6" />
            <div>
              <p className="font-semibold text-sm">RFPN Support</p>
              <p className="text-xs opacity-80">AI-powered assistant</p>
            </div>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn('max-w-[80%] rounded-xl p-3 text-sm whitespace-pre-wrap', m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted')}>
                {m.text}
              </div>
            ))}
            {thinking && (
              <div className="max-w-[80%] rounded-xl p-3 bg-muted flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            )}

            {messages.length <= 1 && faqs.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs font-medium text-muted-foreground">Frequently Asked:</p>
                {faqs.slice(0, 5).map(faq => (
                  <button key={faq.id} onClick={() => handleAsk(faq.question)}
                    className="block w-full text-left text-xs text-primary hover:underline p-1">
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-3 flex gap-2">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask a question..."
              onKeyDown={e => e.key === 'Enter' && query.trim() && !thinking && handleAsk(query)} className="text-sm" disabled={thinking} />
            <Button size="icon" onClick={() => query.trim() && handleAsk(query)} disabled={!query.trim() || thinking}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
