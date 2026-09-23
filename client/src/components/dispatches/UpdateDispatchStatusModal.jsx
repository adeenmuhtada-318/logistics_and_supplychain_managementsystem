import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateDispatchStatus, reportDispatchIncident } from '../../features/dispatch/dispatchSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const UpdateDispatchStatusModal = React.memo(({ isOpen, onClose, dispatchItem }) => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState(dispatchItem?.status || 'En Route');
  const [location, setLocation] = useState(dispatchItem?.currentLocation || '');
  const [notes, setNotes] = useState('');
  const [isIncident, setIsIncident] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!dispatchItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isIncident) {
        await dispatch(
          reportDispatchIncident({
            id: dispatchItem._id,
            incidentNotes: incidentNotes || 'Mechanical or traffic delay reported on corridor.',
            location: location || dispatchItem.currentLocation,
          })
        ).unwrap();
      } else {
        await dispatch(
          updateDispatchStatus({
            id: dispatchItem._id,
            status,
            location,
            notes,
          })
        ).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Dispatch [${dispatchItem.dispatchNumber}]`}
      subtitle="Advance trip checkpoint progress or file route incident report"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-md text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-md">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Current Status
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{dispatchItem.status}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsIncident(!isIncident)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors duration-150 border ${
              isIncident
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-red-500 border-[var(--border)]'
            }`}
          >
            {isIncident ? '🚨 Incident Mode Active' : 'Report Route Incident'}
          </button>
        </div>

        {!isIncident ? (
          <>
            <Select
              label="New Trip Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                'Assigned',
                'Dispatched',
                'En Route',
                'At Checkpoint',
                'Delivered',
                'Cancelled',
              ]}
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />

            <Input
              label="Current Checkpoint Location / Mile Marker"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kalamazoo Logistics Yard (Mile 78)"
              required
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />

            <Input
              label="Checkpoint Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vehicle running at 65 mph, cargo security seals intact."
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-md text-xs text-red-600 dark:text-red-300">
              Reporting an incident flags this dispatch immediately on the Operations Overview and alerts the dispatch manager.
            </div>

            <Input
              label="Incident Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. I-94 Eastbound near Exit 42"
              required
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />

            <Input
              label="Incident Details (Delay reason, mechanical issue, tire blowout, inspection)"
              value={incidentNotes}
              onChange={(e) => setIncidentNotes(e.target.value)}
              placeholder="Describe incident in detail..."
              required
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className={`${isIncident ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1F7A63] hover:bg-[#186350]'} text-white rounded-md h-9 px-4 text-sm transition-colors duration-150`}
          >
            {isIncident ? 'Log Incident Alert' : 'Record Checkpoint & Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
