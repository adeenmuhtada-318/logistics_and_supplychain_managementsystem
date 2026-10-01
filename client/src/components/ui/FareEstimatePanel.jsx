import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Calculator, Route, Clock } from 'lucide-react';
import { estimateFare } from '../../features/orders/orderSlice';

export const FareEstimatePanel = React.memo(({
  pickup,
  dropoff,
  cargoWeightKg,
  priority,
  cargoType,
  onEstimateReady,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    if (!pickup?.city || !dropoff?.city || !(cargoWeightKg > 0)) {
      setEstimate(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      // Assuming estimateFare is a Redux thunk that resolves with the estimate data
      dispatch(estimateFare({ pickup, dropoff, cargoWeightKg, priority, cargoType }))
        .unwrap()
        .then((res) => {
          setEstimate(res);
          if (onEstimateReady) onEstimateReady(res);
        })
        .catch((err) => console.error('Estimation failed', err))
        .finally(() => setLoading(false));
    }, 800);

    return () => clearTimeout(timer);
  }, [pickup?.city, dropoff?.city, cargoWeightKg, priority, cargoType, dispatch, onEstimateReady]);

  if (!pickup?.city || !dropoff?.city || !(cargoWeightKg > 0)) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-[#00E676]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fare Estimate</h3>
      </div>

      {loading ? (
        <div className="flex items-end gap-1 h-12">
          <div className="w-2 h-1/2 bg-[#00E676] rounded-full animate-pulse"></div>
          <div className="w-2 h-3/4 bg-[#00E676] rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-full bg-[#00E676] rounded-full animate-pulse delay-150"></div>
        </div>
      ) : estimate ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-[var(--text-primary)]">
              <span className="flex items-center gap-1">
                <Route size={16} className="text-[#00E676]" />
                {estimate.distanceKm} km
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} className="text-[#00E676]" />
                {estimate.durationHours} hrs
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
              {estimate.method || 'Estimated'}
            </span>
          </div>

          <div className="border-t border-[var(--border)] pt-3">
            <table className="w-full text-xs text-[var(--text-secondary)]">
              <tbody>
                <tr>
                  <td className="py-1">Base Fare</td>
                  <td className="text-right py-1">PKR {estimate.fareBreakdown?.base?.toLocaleString()}</td>
                </tr>
                {estimate.fareBreakdown?.priorityPremium > 0 && (
                  <tr>
                    <td className="py-1">Priority Premium</td>
                    <td className="text-right py-1">PKR {estimate.fareBreakdown.priorityPremium.toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-1">Service Fee (5%)</td>
                  <td className="text-right py-1">PKR {estimate.fareBreakdown?.serviceFee?.toLocaleString()}</td>
                </tr>
                <tr className="text-sm font-bold text-[#00E676]">
                  <td className="py-2">Estimated Total</td>
                  <td className="text-right py-2">PKR {estimate.estimatedFarePKR?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-[10px] text-[var(--text-secondary)] italic mt-2">
            Final fare may vary based on actual distance and waiting time.
          </div>
        </div>
      ) : (
        <div className="text-sm text-[var(--text-secondary)]">Estimate unavailable.</div>
      )}
    </div>
  );
});
