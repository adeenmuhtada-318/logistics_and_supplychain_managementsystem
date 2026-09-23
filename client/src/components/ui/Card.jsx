import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-4 py-3 border-b border-[var(--border)] ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-base font-semibold text-[var(--text-primary)] ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-xs text-[var(--text-secondary)] mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-4 py-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-4 py-3 border-t border-[var(--border)] bg-[var(--table-header)] ${className}`} {...props}>
      {children}
    </div>
  );
};
