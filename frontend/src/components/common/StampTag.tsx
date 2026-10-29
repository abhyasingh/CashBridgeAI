import React from 'react';

export type StampVariant = 'critical' | 'warning' | 'safe' | 'neutral' | 'saffron';

interface StampTagProps {
  label: string;
  variant?: StampVariant;
  rotate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StampTag: React.FC<StampTagProps> = ({
  label,
  variant = 'neutral',
  rotate = false,
  size = 'md',
  className = '',
}) => {
  const variantStyles: Record<StampVariant, string> = {
    critical: 'text-brick-danger border-brick-danger bg-brick-tint/80',
    warning: 'text-amber-800 border-amber-700 bg-amber-50',
    safe: 'text-teal-safe border-teal-safe bg-teal-tint/80',
    saffron: 'text-saffron border-saffron bg-saffron-tint/80',
    neutral: 'text-ink-primary border-ink-muted bg-paper-subtle',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider border',
    md: 'text-xs px-2.5 py-0.5 tracking-widest border-2',
    lg: 'text-sm px-3.5 py-1 tracking-widest border-2',
  };

  const rotationClass = rotate ? '-rotate-1' : '';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase rounded-sm font-sans select-none ${variantStyles[variant]} ${sizeStyles[size]} ${rotationClass} ${className}`}
      style={{
        boxShadow: '1px 1px 0px rgba(17, 26, 36, 0.1)',
      }}
    >
      {label}
    </span>
  );
};
