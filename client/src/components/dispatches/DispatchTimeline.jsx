import React from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Truck,
  FileCheck,
} from 'lucide-react';

export const DispatchTimeline = React.memo(({ checkpoints = [] }) => {
  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-md border border-[var(--border)]">
        No checkpoints recorded for this dispatch.
      </div>
    );
  }

  const sortedCheckpoints = [...checkpoints].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle2 className="w-4 h-4 text-[#1F7A63] dark:text-[#1F7A63]" />;
      case 'Incident Reported':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'En Route':
      case 'At Checkpoint':
        return <Truck className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'Dispatched':
        return <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      default:
        return <FileCheck className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Incident Reported':
        return 'danger';
      case 'En Route':
      case 'At Checkpoint':
        return 'primary';
      case 'Dispatched':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
      {sortedCheckpoints.map((cp, idx) => (
        <div key={cp._id || idx} className="relative group">
          <div className="absolute -left-6 top-1 p-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] shadow-sm group-hover:border-[#1F7A63] transition-colors duration-150 z-10">
            {getStatusIcon(cp.status)}
          </div>

          <div className="p-3.5 bg-[var(--bg-card)] hover:bg-[var(--surface-muted)] border border-[var(--border)] rounded-md transition-colors duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(cp.status)} size="sm">
                  {cp.status}
                </Badge>
                <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" /> {cp.location}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {cp.timestamp ? format(new Date(cp.timestamp), 'MMM dd, yyyy • HH:mm') : ''}
              </span>
            </div>

            {cp.notes && (
              <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-body)] p-2.5 rounded-md border border-[var(--border)] mt-2 font-normal">
                {cp.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});
