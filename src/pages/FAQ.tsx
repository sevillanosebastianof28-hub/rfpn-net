import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number | null;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setFaqs(data);
      }
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))] as string[];

  const filtered = faqs.filter(faq => {
    const matchesSearch = !search || 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/"><Logo size="sm" /></Link>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
              <a href="https://customers.rfpn.net/waitlist-sign-up">
                <Button variant="gradient" size="sm" className="group">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-teal/8 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-amber/6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Knowledge Base</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-foreground">Frequently Asked </span>
            <span className="text-gradient">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know about RFPN.NET — from getting started to security and beyond.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl border-border/50 bg-card/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No questions match your search.</p>
              <button onClick={() => { setSearch(''); setActiveCategory(null); }} className="mt-2 text-primary hover:underline text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filtered.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-border/50 rounded-xl px-6 bg-card/60 backdrop-blur-sm hover:border-primary/20 transition-colors data-[state=open]:border-primary/30 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left text-base font-medium py-5 hover:no-underline">
                    <div className="flex items-start gap-3 pr-4">
                      <span className="text-foreground">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-teal/5 to-primary/10 border border-primary/20">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">Our team is here to help. Get in touch and we'll respond as soon as possible.</p>
            <a href="https://customers.rfpn.net/waitlist-sign-up">
              <Button variant="gradient" size="lg" className="btn-glow group">
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} RFPN.NET. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
