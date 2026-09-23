import React from 'react';

export const Select = React.forwardRef(({
  label,
  options = [],
  className = '',
  wrapperClassName = '',
  name,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        name={name}
        className={`h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 disabled:opacity-50 disabled:bg-surface-muted ${className}`}
        {...props}
      >
        {options.map((opt, i) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const text = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
});

Select.displayName = 'Select';
