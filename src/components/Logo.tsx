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
    md: 'h-20',
    lg: 'h-28',
    xl: 'h-36',
  };

  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <img
        src={rfnbLogo}
        alt="Reley Fast Property Network Logo"
        className={cn('w-auto object-contain', sizeClasses[size])}
      />
      {showText && (
        <span className={cn('font-semibold uppercase tracking-widest text-foreground/80 mt-1', textSizeClasses[size])}>
          Reley Fast Property Network
        </span>
      )}
    </div>
  );
}
