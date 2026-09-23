import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceLogs } from '../features/attendance/attendanceSlice';
import { fetchStaffList } from '../features/auth/authSlice';
import { ClockInCard } from '../components/attendance/ClockInCard';
import { VerifyTimesheetModal } from '../components/attendance/VerifyTimesheetModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { format } from 'date-fns';
import { Clock, CheckCircle, FileCheck } from 'lucide-react';

const AttendanceRow = memo(({ log, user, onVerify }) => {
  const getStatusBadge = (s) => {
    switch (s) {
      case 'Present': return <Badge variant="success">Present</Badge>;
      case 'Late': return <Badge variant="warning">Late</Badge>;
      case 'Half Day': return <Badge variant="purple">Half Day</Badge>;
      case 'Absent': return <Badge variant="danger">Absent</Badge>;
      default: return <Badge variant="secondary">{s}</Badge>;
    }
  };

  return (
    <tr className="border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors duration-150">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
        {format(new Date(log.date), 'MMM dd, yyyy')}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {log.driver?.name}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {log.shiftType}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {log.clockInTime ? format(new Date(log.clockInTime), 'HH:mm') : '--:--'} / {log.clockOutTime ? format(new Date(log.clockOutTime), 'HH:mm') : '--:--'}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {log.totalHoursWorked || 0}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {log.overtimeHours || 0}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        {getStatusBadge(log.status)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-right">
        {(user?.role === 'Fleet_Manager' || user?.role === 'Accountant') ? (
          <Button
            size="sm"
            variant={log.verifiedBy ? 'outline' : 'primary'}
            icon={log.verifiedBy ? CheckCircle : FileCheck}
            onClick={() => onVerify(log)}
            className={log.verifiedBy ? '' : 'bg-[#1F7A63] hover:bg-[#186350] text-white'}
          >
            {log.verifiedBy ? 'Verified' : 'Verify'}
          </Button>
        ) : (
          <span className="text-xs text-[var(--text-secondary)]">
            {log.verifiedBy ? 'Verified' : 'Logged'}
          </span>
        )}
      </td>
    </tr>
  );
});
AttendanceRow.displayName = 'AttendanceRow';

export const AttendancePage = () => {
  const dispatch = useDispatch();
  const { attendanceLogs, loading } = useSelector((state) => state.attendance);
  const { staffList, user } = useSelector((state) => state.auth);

  const [selectedDriver, setSelectedDriver] = useState('All');
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLogForVerify, setSelectedLogForVerify] = useState(null);

  useEffect(() => {
    dispatch(fetchStaffList({ role: 'Driver' }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAttendanceLogs({
        driverId: selectedDriver !== 'All' ? selectedDriver : undefined,
        shiftType: selectedShift !== 'All' ? selectedShift : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      })
    );
  }, [dispatch, selectedDriver, selectedShift, selectedStatus]);

  const handleVerify = useCallback((log) => {
    setSelectedLogForVerify(log);
  }, []);

  const totalHours = useMemo(() => attendanceLogs.reduce((acc, l) => acc + (l.totalHoursWorked || 0), 0), [attendanceLogs]);
  const totalOvertime = useMemo(() => attendanceLogs.reduce((acc, l) => acc + (l.overtimeHours || 0), 0), [attendanceLogs]);
  const totalRegular = useMemo(() => attendanceLogs.reduce((acc, l) => acc + (l.regularHours || 0), 0), [attendanceLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" /> Driver Attendance & Timesheets
          </h1>
        </div>
      </div>

      <ClockInCard />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Total Hours</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{totalHours.toFixed(1)}</div>
        </Card>
        <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Regular Hours</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{totalRegular.toFixed(1)}</div>
        </Card>
        <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
          <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block">Overtime Hours (1.5x)</span>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{totalOvertime.toFixed(1)}</div>
        </Card>
      </div>

      <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user?.role !== 'Driver' && (
            <Select
              label="Filter by Driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              options={[
                { value: 'All', label: 'All Drivers' },
                ...staffList.map((d) => ({ value: d._id, label: d.name })),
              ]}
            />
          )}
          <Select
            label="Shift Type"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            options={[
              { value: 'All', label: 'All Shifts' },
              { value: 'Morning', label: 'Morning' },
              { value: 'Evening', label: 'Evening' },
              { value: 'Night', label: 'Night' },
              { value: 'Long-Haul', label: 'Long-Haul' },
            ]}
          />
          <Select
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Present', label: 'Present' },
              { value: 'Late', label: 'Late' },
              { value: 'Half Day', label: 'Half Day' },
              { value: 'Absent', label: 'Absent' },
            ]}
          />
        </div>
      </Card>

      <Card className="overflow-hidden bg-[var(--bg-card)] border-[var(--border)] rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--table-header)] border-b border-[var(--table-border)]">
              <tr>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Driver</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Shift Type</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Clock In / Out</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Total Hrs</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Overtime</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {loading && attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-[var(--text-secondary)]">Loading attendance...</td>
                </tr>
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-[var(--text-secondary)]">No records found.</td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <AttendanceRow key={log._id} log={log} user={user} onVerify={handleVerify} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedLogForVerify && (
        <VerifyTimesheetModal
          isOpen={!!selectedLogForVerify}
          onClose={() => setSelectedLogForVerify(null)}
          logItem={selectedLogForVerify}
        />
      )}
    </div>
  );
};
