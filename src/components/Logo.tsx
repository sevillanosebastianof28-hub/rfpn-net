import { cn } from '@/lib/utils';
import rfnbLogo from '@/assets/rfnb-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'sidebar' | 'landing';
}

export function Logo({ className, showText = true, size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-20',
    lg: 'h-14',
    xl: 'h-36',
  };

  const textSizeClasses = {
    sm: 'text-[8px] leading-tight',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const displayText = variant === 'sidebar' ? 'RFPN' : 'Reley Fast Property Network';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={rfnbLogo}
        alt="RFPN Logo"
        className={cn('w-auto object-contain shrink-0', sizeClasses[size])}
      />
      {showText && (
        <span className={cn(
          'font-bold uppercase tracking-wider leading-tight',
          textSizeClasses[size],
          variant === 'sidebar' ? 'text-sidebar-foreground' : 'text-foreground/80',
          variant === 'landing' && 'text-lg tracking-widest',
        )}>
          {displayText}
        </span>
      )}
    </div>
  );
}
