import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generatePayroll } from '../../features/payroll/payrollSlice';
import { fetchStaffList } from '../../features/auth/authSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const GeneratePayrollModal = React.memo(({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { staffList } = useSelector((state) => state.auth);

  const defaultStart = new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10);
  const defaultEnd = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
    driverId: 'All',
    defaultAllowances: {
      fuelAllowance: 100.0,
      mealAllowance: 80.0,
      hazardBonus: 0.0,
      performanceBonus: 150.0,
    },
    defaultDeductions: {
      healthInsurance: 90.0,
      otherDeductions: 0.0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchStaffList({ role: 'Driver' }));
    }
  }, [isOpen, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAllowanceChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      defaultAllowances: {
        ...prev.defaultAllowances,
        [e.target.name]: Number(e.target.value),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await dispatch(generatePayroll(formData)).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to generate payroll records');
    } finally {
      setLoading(false);
    }
  };

  const driverOptions = [
    { value: 'All', label: 'All Active Commercial Drivers' },
    ...staffList.map((d) => ({
      value: d._id,
      label: `${d.name} ($${d.hourlyRate}/hr)`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Driver Payroll Batch"
      subtitle="Aggregate verified shift hours, overtime rates (1.5x), allowances, and tax withholdings"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-md text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Pay Period Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Pay Period End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <Select
          label="Target Driver Roster"
          name="driverId"
          value={formData.driverId}
          onChange={handleChange}
          options={driverOptions}
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <div className="p-4 bg-[var(--surface-muted)] border border-[var(--border)] rounded-md space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A63] block">
            Standard Period Allowances & Bonuses ($)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Fuel Stipend"
              type="number"
              name="fuelAllowance"
              value={formData.defaultAllowances.fuelAllowance}
              onChange={handleAllowanceChange}
              min={0}
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
            <Input
              label="Per-Diem Meal"
              type="number"
              name="mealAllowance"
              value={formData.defaultAllowances.mealAllowance}
              onChange={handleAllowanceChange}
              min={0}
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
            <Input
              label="Hazard Bonus"
              type="number"
              name="hazardBonus"
              value={formData.defaultAllowances.hazardBonus}
              onChange={handleAllowanceChange}
              min={0}
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
            <Input
              label="Performance"
              type="number"
              name="performanceBonus"
              value={formData.defaultAllowances.performanceBonus}
              onChange={handleAllowanceChange}
              min={0}
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
          </div>
        </div>

        <div className="p-4 bg-[var(--surface-muted)] border border-[var(--border)] rounded-md space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 block">
            Standard Deductions & Benefits ($)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Health / Dental Insurance"
              type="number"
              name="healthInsurance"
              value={formData.defaultDeductions.healthInsurance}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultDeductions: {
                    ...prev.defaultDeductions,
                    healthInsurance: Number(e.target.value),
                  },
                }))
              }
              min={0}
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
            <div className="text-xs text-[var(--text-secondary)] flex items-center pt-5">
              15% tax withholding and 4% 401(k) deductions are applied automatically.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md h-9 px-4 text-sm transition-colors duration-150">
            Compute & Generate Payroll Slips
          </Button>
        </div>
      </form>
    </Modal>
  );
});
