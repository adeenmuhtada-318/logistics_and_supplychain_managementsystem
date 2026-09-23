import React from 'react';
import { X } from 'lucide-react';

export const Modal = React.memo(({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 transition-colors duration-150" 
        onClick={onClose}
      ></div>
      <div className={`relative bg-[var(--modal-bg)] rounded-md shadow-xl border border-[var(--border)] max-w-lg w-full mx-4 flex flex-col max-h-[90vh] ${className}`}>
        {title && (
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
            <button 
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-4 py-4 overflow-y-auto max-h-[65vh]">
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--table-header)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
