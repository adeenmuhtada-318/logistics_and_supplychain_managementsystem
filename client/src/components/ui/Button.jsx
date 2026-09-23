import React from 'react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white border border-transparent',
    secondary: 'bg-white border-[var(--border)] text-[var(--text-primary)] hover:bg-surface-muted dark:bg-navy-600 dark:border-navy-border dark:text-slate-100 dark:hover:bg-navy-700',
    outline: 'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-surface-muted dark:hover:bg-navy-600',
    destructive: 'bg-red-600 hover:bg-red-700 text-white border border-transparent',
    ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-surface-muted dark:hover:bg-navy-600 border border-transparent'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
