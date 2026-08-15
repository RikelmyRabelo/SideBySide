import React, { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'warning' | 'danger';
}

const variants = {
  emerald: 'bg-emerald-500/10 text-brand-emerald border-emerald-500/20',
  blue: 'bg-blue-500/10 text-brand-blue border-blue-500/20',
  warning: 'bg-amber-500/10 text-brand-warning border-amber-500/20',
  danger: 'bg-red-500/10 text-brand-danger border-red-500/20',
};

export const Badge: React.FC<BadgeProps> = memo(({ children, variant = 'blue' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${variants[variant]}`}>
      {children}    
    </span>
  );
});

Badge.displayName = 'Badge';