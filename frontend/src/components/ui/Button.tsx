import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ember' | 'ghost-ember' | 'surface';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClass: Record<string, string> = {
  ember:        'btn-ember',
  'ghost-ember':'btn-ghost-ember',
  surface:      'btn-surface',
};

const sizeStyle: Record<string, React.CSSProperties> = {
  sm: { padding: '0.5rem 1rem',   fontSize: '0.8125rem' },
  md: {},
  lg: { padding: '1rem 2.5rem',   fontSize: '1rem'      },
};

export function Button({
  variant = 'ember',
  isLoading = false,
  size = 'md',
  children,
  disabled,
  className = '',
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${className}`}
      disabled={disabled || isLoading}
      style={{ ...sizeStyle[size], ...style }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}
