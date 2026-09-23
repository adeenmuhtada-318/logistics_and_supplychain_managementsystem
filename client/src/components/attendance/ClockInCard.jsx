import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clockInDriver,
  clockOutDriver,
  checkTodayAttendance,
} from '../../features/attendance/attendanceSlice';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Clock, Play, Square } from 'lucide-react';
import { format } from 'date-fns';

export const ClockInCard = React.memo(() => {
  const dispatch = useDispatch();
  const { isClockedIn, activeSession, todayLog } = useSelector((state) => state.attendance);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftType, setShiftType] = useState('Morning');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(checkTodayAttendance());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleClockIn = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(clockInDriver({ shiftType })).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, shiftType]);

  const handleClockOut = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(clockOutDriver()).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const getElapsedHours = () => {
    if (!activeSession?.clockInTime) return '0.0 hrs';
    const diffMs = currentTime - new Date(activeSession.clockInTime);
    const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hrs`;
  };

  return (
    <Card className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-md bg-[#1F7A63]/10 text-[#1F7A63]">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                Shift Clock
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Track regular and overtime hours
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mt-3">
            <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
              {format(currentTime, 'hh:mm:ss a')}
            </div>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              {format(currentTime, 'EEEE, MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="p-3.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-right sm:min-w-[170px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
              Duty Status
            </span>
            {isClockedIn ? (
              <div>
                <Badge variant="success" size="md" dot>
                  ON DUTY (Active)
                </Badge>
                <div className="text-xs font-mono text-[#1F7A63] font-bold mt-1">
                  Elapsed: {getElapsedHours()}
                </div>
              </div>
            ) : (
              <div>
                <Badge variant="default" size="md">
                  OFF DUTY (Clocked Out)
                </Badge>
                {todayLog && (
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    Last shift: {todayLog.totalHoursWorked} hrs
                  </div>
                )}
              </div>
            )}
          </div>

          {!isClockedIn ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                options={['Morning', 'Evening', 'Night', 'Long-Haul']}
                className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
              />
              <Button
                onClick={handleClockIn}
                loading={loading}
                icon={Play}
                size="lg"
                className="whitespace-nowrap font-bold bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md transition-colors duration-150"
              >
                Punch Clock IN
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleClockOut}
              loading={loading}
              icon={Square}
              size="lg"
              className="whitespace-nowrap font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors duration-150"
            >
              Punch Clock OUT
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});
