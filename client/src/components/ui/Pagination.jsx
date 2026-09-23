import React from 'react';
import { Button } from './Button';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-xs text-[var(--text-secondary)]">
      <div>
        Showing {totalItems > 0 ? startItem : 0}-{totalItems > 0 ? endItem : 0} of {totalItems} items
      </div>
      
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select 
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            {[10, 25, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="xs" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8"
        >
          Prev
        </Button>
        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-[2rem] px-2 rounded-md transition-colors duration-150 ${
                currentPage === page 
                  ? 'bg-brand-500 text-white' 
                  : 'hover:bg-surface-muted dark:hover:bg-navy-600'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="xs" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
