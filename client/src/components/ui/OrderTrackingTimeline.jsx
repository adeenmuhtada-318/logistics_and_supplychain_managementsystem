import React from 'react';

const TimelineItem = React.memo(({ checkpoint, isLast }) => {
  const isCompleted = checkpoint.status === 'completed';
  const isActive = checkpoint.status === 'active';
  
  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div className="absolute left-[7px] top-6 bottom-0 w-0 border-l-2 border-[#2A2A2A] ml-1"></div>
      )}
      
      <div className="flex flex-col items-center mt-1 z-10">
        <div 
          className={`w-[18px] h-[18px] rounded-full border-2 bg-[var(--bg-card)] flex items-center justify-center
            ${isCompleted ? 'border-[#00E676] bg-[#00E676]' : isActive ? 'border-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.6)]' : 'border-[#3A3A3A]'}
          `}
        >
          {isCompleted && (
            <svg className="w-2.5 h-2.5 text-[#121212]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-[#00E676]"></div>
          )}
        </div>
      </div>
      
      <div className="pb-8">
        <h4 className="text-sm font-medium text-[var(--text-primary)]">{checkpoint.label}</h4>
        
        <div className="flex flex-wrap items-center gap-x-2 mt-1">
          {checkpoint.timestamp && (
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              {new Date(checkpoint.timestamp).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          )}
          {checkpoint.location && (
            <>
              <span className="text-[var(--text-secondary)] text-xs">&bull;</span>
              <span className="text-xs text-[var(--text-secondary)]">{checkpoint.location}</span>
            </>
          )}
        </div>

        {checkpoint.notes && (
          <p className="mt-1 text-xs italic text-[var(--text-secondary)]">
            "{checkpoint.notes}"
          </p>
        )}
      </div>
    </div>
  );
});

export const OrderTrackingTimeline = ({ order, checkpoints = [] }) => {
  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-md text-sm text-[var(--text-secondary)] text-center">
        No tracking data available yet.
      </div>
    );
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-md">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Order Tracking</h3>
      <div className="flex flex-col">
        {checkpoints.map((cp, idx) => (
          <TimelineItem 
            key={cp.id || idx} 
            checkpoint={cp} 
            isLast={idx === checkpoints.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};
