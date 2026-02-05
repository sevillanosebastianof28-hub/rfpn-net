import { cn } from '@/lib/utils';
import rfnbLogo from '@/assets/rfnb-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Image */}
      <img
        src={rfnbLogo}
        alt="RFNB Logo"
        className={cn('w-auto object-contain', sizeClasses[size])}
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight text-foreground', textSizeClasses[size])}>
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
