import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { verifyTimesheet } from '../../features/attendance/attendanceSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const VerifyTimesheetModal = React.memo(({ isOpen, onClose, logItem }) => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState('Present');
  const [regularHours, setRegularHours] = useState(8);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (logItem) {
      setStatus(logItem.status || 'Present');
      setRegularHours(logItem.regularHours || 8);
      setOvertimeHours(logItem.overtimeHours || 0);
      setNotes(logItem.notes || '');
    }
  }, [logItem, isOpen]);

  if (!logItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        verifyTimesheet({
          id: logItem._id,
          status,
          regularHours: Number(regularHours),
          overtimeHours: Number(overtimeHours),
          notes,
        })
      ).unwrap();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verify Timesheet: ${logItem.driver?.name || 'Driver'}`}
      subtitle="Audit shift hours, regular vs overtime breakdown, and attendance status"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-md text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Driver:</span>
            <span className="font-semibold text-[var(--text-primary)]">{logItem.driver?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Shift Type:</span>
            <span className="font-semibold text-blue-500 dark:text-blue-400">{logItem.shiftType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Total System Hours:</span>
            <span className="font-mono text-[#1F7A63] font-bold">
              {logItem.totalHoursWorked} hrs
            </span>
          </div>
        </div>

        <Select
          label="Attendance Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={['Present', 'Late', 'Half Day', 'Absent', 'On Leave']}
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Verified Regular Hours"
            type="number"
            value={regularHours}
            onChange={(e) => setRegularHours(e.target.value)}
            step="0.1"
            min="0"
            max="24"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Verified Overtime Hours (1.5x)"
            type="number"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
            step="0.1"
            min="0"
            max="24"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <Input
          label="Verification Auditor Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Approved with 1.5 hrs extended depot staging overtime."
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md h-9 px-4 text-sm transition-colors duration-150">
            Approve & Verify Timesheet
          </Button>
        </div>
      </form>
    </Modal>
  );
});
