import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatePayrollStatus } from '../../features/payroll/payrollSlice';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { Printer, CheckCircle, DollarSign } from 'lucide-react';

export const PayslipModal = React.memo(({ isOpen, onClose, payrollItem }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (!payrollItem) return null;

  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    try {
      await dispatch(
        updatePayrollStatus({
          id: payrollItem._id,
          paymentStatus: newStatus,
          paymentMethod: 'Direct Deposit',
        })
      ).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success" size="md">PAID & DISBURSED</Badge>;
      case 'Approved':
        return <Badge variant="primary" size="md">APPROVED FOR PAYMENT</Badge>;
      default:
        return <Badge variant="warning" size="md">DRAFT PENDING APPROVAL</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Driver Earnings Statement: ${payrollItem.payrollId}`}
      subtitle="Official Logistics & Fleet Compensation Statement"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 print:text-black">
        <div className="p-5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {payrollItem.staff?.name || 'Commercial Driver'}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              License: <span className="font-mono text-[var(--text-primary)]">{payrollItem.staff?.licenseNumber || 'CDL-Class-A'}</span> • Rate: <span className="font-mono text-[#1F7A63]">${payrollItem.hourlyRate}/hr</span>
            </div>
          </div>
          <div>{getStatusBadge(payrollItem.paymentStatus)}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[var(--surface-muted)] p-4 rounded-md border border-[var(--border)]">
          <div>
            <span className="text-[var(--text-secondary)] uppercase tracking-wider block font-semibold text-[10px]">
              Period Start
            </span>
            <span className="font-semibold text-[var(--text-primary)] font-mono">
              {payrollItem.payPeriodStart ? format(new Date(payrollItem.payPeriodStart), 'MMM dd, yyyy') : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] uppercase tracking-wider block font-semibold text-[10px]">
              Period End
            </span>
            <span className="font-semibold text-[var(--text-primary)] font-mono">
              {payrollItem.payPeriodEnd ? format(new Date(payrollItem.payPeriodEnd), 'MMM dd, yyyy') : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] uppercase tracking-wider block font-semibold text-[10px]">
              Payment Method
            </span>
            <span className="font-semibold text-[var(--text-primary)]">{payrollItem.paymentMethod || 'Direct Deposit'}</span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] uppercase tracking-wider block font-semibold text-[10px]">
              Disbursed Date
            </span>
            <span className="font-semibold text-[#1F7A63] font-mono">
              {payrollItem.paidDate ? format(new Date(payrollItem.paidDate), 'MMM dd, yyyy') : 'Pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-[var(--bg-card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold text-[#1F7A63] uppercase tracking-wider">
                Earnings Breakdown
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Amount</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Regular Hours ({payrollItem.regularHours} hrs @ ${payrollItem.hourlyRate})
                </span>
                <span className="font-mono text-[var(--text-primary)] font-semibold">
                  ${payrollItem.regularPay?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Overtime (1.5x) ({payrollItem.overtimeHours} hrs @ ${(payrollItem.hourlyRate * 1.5).toFixed(2)})
                </span>
                <span className="font-mono text-[var(--text-primary)] font-semibold">
                  ${payrollItem.overtimePay?.toFixed(2)}
                </span>
              </div>
              {payrollItem.allowances?.fuelAllowance > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Fuel Stipend</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    +${payrollItem.allowances.fuelAllowance.toFixed(2)}
                  </span>
                </div>
              )}
              {payrollItem.allowances?.mealAllowance > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Per-Diem Meal Allowance</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    +${payrollItem.allowances.mealAllowance.toFixed(2)}
                  </span>
                </div>
              )}
              {payrollItem.allowances?.performanceBonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">On-Time Route Performance Bonus</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    +${payrollItem.allowances.performanceBonus.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[var(--border)] flex justify-between font-bold text-sm">
                <span className="text-[var(--text-primary)]">Total Gross Earnings</span>
                <span className="font-mono text-[#1F7A63]">${payrollItem.grossPay?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[var(--bg-card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Deductions & Withholdings
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Amount</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Federal/State Tax Withholding</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-semibold">
                  -${payrollItem.deductions?.taxWithholding?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Health & Dental Insurance</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-semibold">
                  -${payrollItem.deductions?.healthInsurance?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">401(k) Retirement Contribution</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-semibold">
                  -${payrollItem.deductions?.retirement401k?.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border)] flex justify-between font-bold text-sm">
                <span className="text-[var(--text-primary)]">Total Deductions</span>
                <span className="font-mono text-red-600 dark:text-red-400">
                  -$
                  {(
                    (payrollItem.deductions?.taxWithholding || 0) +
                    (payrollItem.deductions?.healthInsurance || 0) +
                    (payrollItem.deductions?.retirement401k || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[var(--bg-card)] border border-[#1F7A63]/30 rounded-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A63] block">
              Net Direct Deposit Disbursed
            </span>
            <span className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
              ${payrollItem.netPay?.toFixed(2)}
            </span>
          </div>
          <DollarSign className="w-10 h-10 text-[#1F7A63] opacity-50" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="outline" icon={Printer} onClick={handlePrint} className="rounded-md h-9 text-sm">
            Print Statement
          </Button>

          <div className="flex items-center gap-2">
            {payrollItem.paymentStatus === 'Draft' && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md h-9 px-4 text-sm transition-colors duration-150"
                onClick={() => handleUpdateStatus('Approved')}
                loading={loading}
              >
                Approve Wage Statement
              </Button>
            )}

            {payrollItem.paymentStatus === 'Approved' && (
              <Button
                className="bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md h-9 px-4 text-sm transition-colors duration-150 flex items-center gap-2"
                onClick={() => handleUpdateStatus('Paid')}
                loading={loading}
              >
                <CheckCircle className="w-4 h-4" /> Process & Mark as PAID
              </Button>
            )}

            <Button variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
});
