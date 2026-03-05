import { cn } from '@/lib/utils';
import rfnbLogo from '@/assets/rfnb-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'sidebar';
}

export function Logo({ className, showText = true, size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-20',
    lg: 'h-28',
    xl: 'h-36',
  };

  const textSizeClasses = {
    sm: 'text-[8px] leading-tight',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
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
        )}>
          RFPN
        </span>
      )}
    </div>
  );
}
