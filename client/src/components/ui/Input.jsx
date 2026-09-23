import React from 'react';

export const Input = React.forwardRef(({
  label,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-[var(--coolgray)]" />
          </div>
        )}
        <input
          ref={ref}
          className={`h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--coolgray)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 disabled:opacity-50 disabled:bg-surface-muted ${Icon ? 'pl-9' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';
