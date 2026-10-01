import React from 'react';

export const BentoGrid = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
    {children}
  </div>
);

export const BentoCard = ({ children, className = '', span = 1, rowSpan = 1 }) => {
  const colSpanMap = { 
    1: '', 
    2: 'sm:col-span-2', 
    3: 'sm:col-span-2 lg:col-span-3', 
    4: 'sm:col-span-2 lg:col-span-4' 
  };
  
  const rowSpanMap = { 
    1: '', 
    2: 'row-span-2' 
  };
  
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-md overflow-hidden ${colSpanMap[span] || ''} ${rowSpanMap[rowSpan] || ''} ${className}`}>
      {children}
    </div>
  );
};
