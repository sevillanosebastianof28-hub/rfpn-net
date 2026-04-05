import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DevelopmentFunding() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to Home
        </Link>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Development Funding</h1>
          </div>

          <p className="text-lg text-muted-foreground">
            Access competitive development finance for your next project. From ground-up builds to major refurbishments, we connect you with the right lenders.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {['Ground-Up Development', 'Heavy Refurbishment', 'Conversion Projects', 'New Build Schemes'].map(item => (
              <div key={item} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{item}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Tailored funding solutions for {item.toLowerCase()}.</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild size="lg">
              <Link to="/book-appointment">Book a Consultation <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/register">Apply Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
