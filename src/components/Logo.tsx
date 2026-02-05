import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon */}
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        <svg
          viewBox="0 0 40 40"
          className={cn('w-auto', sizeClasses[size])}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring with gradient */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            fill="none"
          />
          {/* Inner geometric pattern */}
          <path
            d="M20 8L28 14V26L20 32L12 26V14L20 8Z"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Center connection lines */}
          <path
            d="M20 14V26M14 17L20 14L26 17M14 23L20 26L26 23"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Connection nodes */}
          <circle cx="20" cy="14" r="2" fill="hsl(var(--primary))" />
          <circle cx="20" cy="26" r="2" fill="hsl(var(--primary))" />
          <circle cx="14" cy="17" r="1.5" fill="hsl(var(--primary-glow))" />
          <circle cx="26" cy="17" r="1.5" fill="hsl(var(--primary-glow))" />
          <circle cx="14" cy="23" r="1.5" fill="hsl(var(--primary-glow))" />
          <circle cx="26" cy="23" r="1.5" fill="hsl(var(--primary-glow))" />
          
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(270, 60%, 50%)" />
              <stop offset="100%" stopColor="hsl(270, 70%, 60%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight text-gradient', textSizeClasses[size])}>
            RFNB
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
            Fast Network Building
          </span>
        </div>
      )}
    </div>
  );
}
