import React from 'react';

export type ButtonVariant = 'primary' | 'saffron' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface LedgerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const LedgerButton: React.FC<LedgerButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none rounded-[3px] border focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-ink-primary text-[#F7F4EC] border-ink-primary hover:bg-black shadow-[0_2px_4px_rgba(17,26,36,0.15)] active:translate-y-[1px]',
    saffron:
      'bg-saffron text-white border-[#C25613] hover:bg-[#C25613] shadow-[0_2px_4px_rgba(217,101,28,0.25)] active:translate-y-[1px]',
    outline:
      'bg-transparent text-ink-primary border-paper-line hover:bg-paper-subtle hover:border-ink-muted active:translate-y-[1px]',
    danger:
      'bg-brick-danger text-white border-[#9F2A20] hover:bg-[#9F2A20] active:translate-y-[1px]',
    ghost:
      'bg-transparent text-ink-primary border-transparent hover:bg-paper-subtle/80',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
