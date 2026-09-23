import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { fetchDispatches, deleteDispatch } from '../features/dispatch/dispatchSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CreateDispatchModal } from '../components/dispatches/CreateDispatchModal';
import { UpdateDispatchStatusModal } from '../components/dispatches/UpdateDispatchStatusModal';
import { DispatchTimeline } from '../components/dispatches/DispatchTimeline';
import { Send, Plus, Search, MapPin, User, Trash2 } from 'lucide-react';

const DispatchRow = React.memo(({ disp, onStatusClick, onTimelineClick, onDelete, canDelete }) => {
  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Urgent':
        return <Badge variant="warning">{p}</Badge>;
      case 'Critical':
      case 'Hazardous/Critical':
        return <Badge variant="danger">{p}</Badge>;
      case 'Express':
        return <Badge variant="info">{p}</Badge>;
      default:
        return <Badge variant="default">Standard</Badge>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'Incident Reported':
        return <Badge variant="danger">Incident Reported</Badge>;
      case 'En Route':
        return <Badge variant="primary">En Route</Badge>;
      case 'At Checkpoint':
        return <Badge variant="purple">At Checkpoint</Badge>;
      case 'Dispatched':
        return <Badge variant="info">Dispatched</Badge>;
      default:
        return <Badge variant="default">Assigned</Badge>;
    }
  };

  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors duration-150">
      <td className="p-3 text-sm text-[var(--text-primary)]">
        <button
          onClick={() => onTimelineClick(disp)}
          className="font-medium text-[#1F7A63] hover:underline text-left"
        >
          {disp.dispatchNumber}
        </button>
      </td>
      <td className="p-3 text-sm text-[var(--text-primary)]">
        <div className="font-medium">{disp.vehicle?.plateNumber}</div>
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
          <User className="w-3 h-3" /> {disp.driver?.name}
        </div>
      </td>
      <td className="p-3 text-sm text-[var(--text-primary)]">
        <div className="font-medium">{disp.route?.routeCode}</div>
        <div className="text-xs text-[var(--text-muted)]">
          {disp.route?.originHub} ➔ {disp.route?.destinationHub}
        </div>
      </td>
      <td className="p-3 text-sm text-[var(--text-primary)]">
        <div className="truncate max-w-[150px]">{disp.cargoDescription}</div>
      </td>
      <td className="p-3 text-sm text-[var(--text-primary)]">
        {disp.cargoWeightKg?.toLocaleString()} kg
      </td>
      <td className="p-3 text-sm">
        {getPriorityBadge(disp.priority)}
      </td>
      <td className="p-3 text-sm">
        <div className="flex flex-col items-start gap-1">
          {getStatusBadge(disp.status)}
          {disp.currentLocation && (
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 truncate max-w-[120px]">
              <MapPin className="w-3 h-3" /> {disp.currentLocation}
            </div>
          )}
        </div>
      </td>
      <td className="p-3 text-sm text-[var(--text-primary)]">
        {disp.departureTime ? format(new Date(disp.departureTime), 'MMM dd, HH:mm') : '-'}
      </td>
      <td className="p-3 text-sm text-[var(--text-primary)]">
        {disp.estimatedArrivalTime ? format(new Date(disp.estimatedArrivalTime), 'MMM dd, HH:mm') : '-'}
      </td>
      <td className="p-3 text-sm text-right">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onStatusClick(disp)}>
            Update Status
          </Button>
          <Button size="sm" variant="outline" onClick={() => onTimelineClick(disp)}>
            Timeline
          </Button>
          {canDelete && (
            <button
              onClick={() => onDelete(disp._id, disp.dispatchNumber)}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors duration-150 p-1"
              title="Delete Dispatch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export const DispatchesPage = () => {
  const dispatch = useDispatch();
  const { dispatches, loading } = useSelector((state) => state.dispatches);
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDispatchForStatus, setSelectedDispatchForStatus] = useState(null);
  const [selectedDispatchForDetails, setSelectedDispatchForDetails] = useState(null);

  useEffect(() => {
    dispatch(fetchDispatches());
  }, [dispatch]);

  const filteredDispatches = useMemo(() => {
    if (!dispatches) return [];
    return dispatches.filter((disp) => {
      const q = search.toLowerCase();
      const matchesSearch =
        disp.dispatchNumber?.toLowerCase().includes(q) ||
        disp.cargoDescription?.toLowerCase().includes(q) ||
        disp.driver?.name?.toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === 'All' || disp.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || disp.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [dispatches, search, statusFilter, priorityFilter]);

  const handleDelete = useCallback(
    async (id, dispatchNumber) => {
      if (window.confirm(`Are you sure you want to delete dispatch ${dispatchNumber}?`)) {
        await dispatch(deleteDispatch(id));
      }
    },
    [dispatch]
  );

  const handleStatusClick = useCallback((disp) => {
    setSelectedDispatchForStatus(disp);
  }, []);

  const handleTimelineClick = useCallback((disp) => {
    setSelectedDispatchForDetails(disp);
  }, []);

  const canDelete = user?.role === 'Fleet_Manager' || user?.role === 'Admin';
  const canCreate = user?.role === 'Fleet_Manager' || user?.role === 'Dispatcher' || user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Send className="w-5 h-5 text-[#1F7A63]" /> Dispatch Logs & Manifests
          </h1>
        </div>
        {canCreate && (
          <Button 
            className="bg-[#1F7A63] hover:bg-[#186350] text-white" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Schedule Dispatch
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            icon={Search}
            placeholder="Search by Dispatch #, Cargo, Driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Assigned', label: 'Assigned' },
              { value: 'Dispatched', label: 'Dispatched' },
              { value: 'En Route', label: 'En Route' },
              { value: 'At Checkpoint', label: 'At Checkpoint' },
              { value: 'Delivered', label: 'Delivered' },
              { value: 'Incident Reported', label: 'Incident Reported' },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Priorities' },
              { value: 'Standard', label: 'Standard' },
              { value: 'Express', label: 'Express' },
              { value: 'Urgent', label: 'Urgent' },
              { value: 'Critical', label: 'Critical' },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-muted)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Dispatch #</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Vehicle / Driver</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Route</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Cargo</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Weight</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Priority</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Status</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">Departure</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)]">ETA</th>
                <th className="p-3 text-xs font-medium text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-sm text-[var(--text-muted)]">
                    Loading dispatches...
                  </td>
                </tr>
              ) : filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-sm text-[var(--text-muted)]">
                    No dispatches found.
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((disp) => (
                  <DispatchRow
                    key={disp._id}
                    disp={disp}
                    onStatusClick={handleStatusClick}
                    onTimelineClick={handleTimelineClick}
                    onDelete={handleDelete}
                    canDelete={canDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateDispatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedDispatchForStatus && (
        <UpdateDispatchStatusModal
          isOpen={!!selectedDispatchForStatus}
          onClose={() => setSelectedDispatchForStatus(null)}
          dispatchItem={selectedDispatchForStatus}
        />
      )}

      {selectedDispatchForDetails && (
        <Modal
          isOpen={!!selectedDispatchForDetails}
          onClose={() => setSelectedDispatchForDetails(null)}
          title={`Timeline: ${selectedDispatchForDetails.dispatchNumber}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--bg-muted)] p-4 rounded-md border border-[var(--border)]">
              <div>
                <span className="block text-xs text-[var(--text-muted)]">Vehicle</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedDispatchForDetails.vehicle?.plateNumber}
                </span>
              </div>
              <div>
                <span className="block text-xs text-[var(--text-muted)]">Driver</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedDispatchForDetails.driver?.name}
                </span>
              </div>
              <div>
                <span className="block text-xs text-[var(--text-muted)]">Route</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedDispatchForDetails.route?.routeCode}
                </span>
              </div>
              <div>
                <span className="block text-xs text-[var(--text-muted)]">Status</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedDispatchForDetails.status}
                </span>
              </div>
            </div>
            
            <DispatchTimeline checkpoints={selectedDispatchForDetails.checkpoints || []} />
            
            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
              <Button variant="outline" onClick={() => setSelectedDispatchForDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
