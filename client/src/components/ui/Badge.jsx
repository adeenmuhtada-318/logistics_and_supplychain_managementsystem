import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-md font-medium uppercase tracking-wider transition-colors duration-150';
  
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    primary: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};
