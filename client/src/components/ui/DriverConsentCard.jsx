import React, { useState, useEffect } from 'react';

export const DriverConsentCard = React.memo(({ order, onRespond, loading }) => {
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onRespond) onRespond('Declined');
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onRespond]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isUrgent = timeLeft < 60;
  
  const priorityColors = {
    Standard: 'text-[var(--text-primary)] border-[#3A3A3A]',
    Express: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    Urgent: 'text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/10',
  };

  const pColor = priorityColors[order?.priority] || priorityColors.Standard;

  return (
    <div className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-md overflow-hidden shadow-xl">
      <div className="bg-[#181818] px-4 py-3 border-b border-[#2A2A2A] flex justify-between items-center">
        <h2 className="text-[#00E676] font-bold flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          New Delivery Request
        </h2>
        <div className={`text-sm font-mono font-medium ${isUrgent ? 'text-[#FF5252]' : 'text-[var(--text-primary)]'}`}>
          Offer expires in {formatTime(timeLeft)}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left Column - Route */}
          <div className="flex flex-col gap-3">
            <div>
              <span className="inline-block px-2 py-0.5 text-xs bg-[#2A2A2A] text-[var(--text-secondary)] rounded-sm mb-1">From</span>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {order?.pickup?.city}, {order?.pickup?.province}
              </div>
            </div>
            
            <div className="ml-2 border-l-2 border-[#00E676]/30 h-6 flex items-center">
              <svg className="w-4 h-4 text-[#00E676] -ml-[9px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <div>
              <span className="inline-block px-2 py-0.5 text-xs bg-[#2A2A2A] text-[var(--text-secondary)] rounded-sm mb-1">To</span>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {order?.dropoff?.city}, {order?.dropoff?.province}
              </div>
            </div>
          </div>

          {/* Right Column - Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#121212] p-2 rounded-md border border-[#2A2A2A] flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase">Distance</span>
              <span className="text-sm text-[var(--text-primary)]">{order?.calculatedDistanceKm ?? 'Calculating...'} km</span>
            </div>
            <div className="bg-[#121212] p-2 rounded-md border border-[#2A2A2A] flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase">Duration</span>
              <span className="text-sm text-[var(--text-primary)]">{order?.calculatedDurationHours ?? '...'} hrs</span>
            </div>
            <div className="bg-[#121212] p-2 rounded-md border border-[#2A2A2A] flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase">Cargo</span>
              <span className="text-sm text-[var(--text-primary)] truncate" title={order?.cargoDescription}>{order?.cargoDescription}</span>
              <span className="text-xs text-[var(--text-secondary)]">{order?.cargoWeightKg} kg</span>
            </div>
            <div className="bg-[#121212] p-2 rounded-md border border-[#2A2A2A] flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase">Priority</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-sm border inline-block mt-0.5 self-start ${pColor}`}>
                {order?.priority || 'Standard'}
              </span>
            </div>
            
            <div className="col-span-2 bg-[#121212] p-3 rounded-md border border-[#00E676]/30 flex flex-col justify-center items-center mt-2 shadow-[0_0_10px_rgba(0,230,118,0.05)]">
              <span className="text-xs text-[var(--text-secondary)] uppercase mb-1">Est. Fare</span>
              <span className="text-xl font-bold text-[#00E676]">
                PKR {order?.estimatedFarePKR?.toLocaleString() || '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 border-t border-[#2A2A2A] bg-[#181818]">
        <button
          onClick={() => onRespond && onRespond('Declined')}
          disabled={loading}
          className="w-full py-2.5 rounded-md bg-transparent border border-[#FF5252] text-[#FF5252] hover:bg-[#FF5252]/10 transition-colors text-sm font-bold disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={() => onRespond && onRespond('Accepted')}
          disabled={loading}
          className="w-full py-2.5 rounded-md bg-[#00E676] hover:bg-[#00C264] text-[#121212] transition-colors text-sm font-bold disabled:opacity-50"
        >
          {loading ? 'Accepting...' : 'Accept'}
        </button>
      </div>
    </div>
  );
});
