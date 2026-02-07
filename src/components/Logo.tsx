import { cn } from '@/lib/utils';
import rfnbLogo from '@/assets/rfnb-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-14',
    md: 'h-20',
    lg: 'h-28',
    xl: 'h-36',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <img
        src={rfnbLogo}
        alt="Reley Fast Property Network Logo"
        className={cn('w-auto object-contain', sizeClasses[size])}
      />
    </div>
  );
}
