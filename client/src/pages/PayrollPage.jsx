import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayrollList, deletePayroll, updatePayrollStatus } from '../features/payroll/payrollSlice';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { GeneratePayrollModal } from '../components/payroll/GeneratePayrollModal';
import { PayslipModal } from '../components/payroll/PayslipModal';
import { format } from 'date-fns';
import { CircleDollarSign, Plus, FileText, CheckCircle, Trash2 } from 'lucide-react';

const PayrollRow = memo(({ payroll, user, onViewPayslip, onApprove, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Approved': return <Badge variant="info">Approved</Badge>;
      default: return <Badge variant="warning">Draft</Badge>;
    }
  };

  const canManage = user?.role === 'Fleet_Manager' || user?.role === 'Accountant';

  return (
    <tr className="border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors duration-150">
      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
        {payroll.payrollId}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {payroll.staff?.name}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {payroll.payPeriodStart ? format(new Date(payroll.payPeriodStart), 'MM/dd') : ''} -{' '}
        {payroll.payPeriodEnd ? format(new Date(payroll.payPeriodEnd), 'MM/dd/yy') : ''}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {payroll.regularHours || 0}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {payroll.overtimeHours || 0}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        ${(payroll.hourlyRate || 0).toFixed(2)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        ${(payroll.grossPay || 0).toFixed(2)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
        ${(payroll.netPay || 0).toFixed(2)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        {getStatusBadge(payroll.paymentStatus)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewPayslip(payroll)}
            className="p-1 text-[var(--text-secondary)] hover:text-brand-500 transition-colors duration-150"
            title="View Payslip"
          >
            <FileText className="w-4 h-4" />
          </button>
          {payroll.paymentStatus === 'Draft' && canManage && (
            <button
              onClick={() => onApprove(payroll._id)}
              className="p-1 text-[var(--text-secondary)] hover:text-blue-500 transition-colors duration-150"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {canManage && (
            <button
              onClick={() => onDelete(payroll._id, payroll.payrollId)}
              className="p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors duration-150"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});
PayrollRow.displayName = 'PayrollRow';

export const PayrollPage = () => {
  const dispatch = useDispatch();
  const { payrollList, loading } = useSelector((state) => state.payroll);
  const { user } = useSelector((state) => state.auth);

  const [statusFilter, setStatusFilter] = useState('All');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    dispatch(fetchPayrollList({ status: statusFilter !== 'All' ? statusFilter : undefined }));
  }, [dispatch, statusFilter]);

  const handleDelete = useCallback(async (id, payrollId) => {
    if (window.confirm(`Delete payroll draft ${payrollId}?`)) {
      await dispatch(deletePayroll(id));
    }
  }, [dispatch]);

  const handleApprove = useCallback(async (id) => {
    await dispatch(updatePayrollStatus({ id, paymentStatus: 'Approved' }));
  }, [dispatch]);

  const handleViewPayslip = useCallback((payroll) => {
    setSelectedPayslip(payroll);
  }, []);

  const totalGross = useMemo(() => payrollList.reduce((acc, p) => acc + (p.grossPay || 0), 0), [payrollList]);
  const totalNet = useMemo(() => payrollList.reduce((acc, p) => acc + (p.netPay || 0), 0), [payrollList]);
  const pendingCount = useMemo(() => payrollList.filter((p) => p.paymentStatus === 'Draft').length, [payrollList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-brand-500" /> Driver Payroll & Compensation
          </h1>
        </div>

        {(user?.role === 'Fleet_Manager' || user?.role === 'Accountant') && (
          <Button
            className="bg-[#1F7A63] hover:bg-[#186350] text-white"
            icon={Plus}
            onClick={() => setIsGenerateModalOpen(true)}
          >
            Generate Batch
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Total Gross</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Total Net Disbursed</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Pending Approval</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {pendingCount}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Filter Status:</span>
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Paid', label: 'Paid' },
            ]}
          />
        </div>
      </Card>

      <Card className="overflow-hidden bg-[var(--bg-card)] border-[var(--border)] rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--table-header)] border-b border-[var(--table-border)]">
              <tr>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Payroll ID</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Driver</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Pay Period</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Regular Hrs</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">OT Hrs</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Hourly Rate</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Gross ($)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Net ($)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {loading && payrollList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-[var(--text-secondary)]">Loading payroll...</td>
                </tr>
              ) : payrollList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-[var(--text-secondary)]">No payroll records found.</td>
                </tr>
              ) : (
                payrollList.map((p) => (
                  <PayrollRow
                    key={p._id}
                    payroll={p}
                    user={user}
                    onViewPayslip={handleViewPayslip}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <GeneratePayrollModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />

      {selectedPayslip && (
        <PayslipModal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          payrollItem={selectedPayslip}
        />
      )}
    </div>
  );
};
