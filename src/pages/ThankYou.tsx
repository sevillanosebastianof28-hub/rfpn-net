import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThankYou() {
  const navigate = useNavigate();
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('rfpn_submission_complete');
    if (flag) {
      setValid(true);
      sessionStorage.removeItem('rfpn_submission_complete');
    } else {
      // Allow direct access but show a softer state
      setValid(true);
    }
  }, []);

  if (!valid) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Thank You</h1>
        <p className="text-muted-foreground">
          Your submission has been received successfully. Our team will review your information and be in touch shortly.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Button asChild variant="outline">
            <Link to="/"><Home className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
