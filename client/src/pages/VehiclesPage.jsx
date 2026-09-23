import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVehicles,
  deleteVehicle,
  updateVehicleStatus,
} from '../features/fleet/vehicleSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { VehicleModal } from '../components/vehicles/VehicleModal';
import {
  Truck,
  Plus,
  Search,
  Wrench,
  Trash2,
  Edit3
} from 'lucide-react';

const StatusBadge = React.memo(({ status }) => {
  switch (status) {
    case 'Available':
      return <Badge variant="success">Available</Badge>;
    case 'In Transit':
      return <Badge variant="primary">In Transit</Badge>;
    case 'Under Maintenance':
      return <Badge variant="warning">Under Maintenance</Badge>;
    case 'Out of Service':
      return <Badge variant="danger">Out of Service</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
});

const VehicleRow = React.memo(({ vehicle, onEdit, onToggleMaintenance, onDelete, userRole }) => {
  return (
    <tr className="border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors duration-150">
      <td className="px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
        {vehicle.plateNumber}
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.make} {vehicle.model}
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.year}
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.type || 'N/A'}
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.capacityKg?.toLocaleString() || 'N/A'}
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.currentOdometerKm?.toLocaleString() || '0'}
      </td>
      <td className="px-3 py-2.5 text-sm whitespace-nowrap">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.assignedDriver?.name || 'Unassigned'}
      </td>
      <td className="px-3 py-2.5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {vehicle.currentHubLocation || 'N/A'}
      </td>
      <td className="px-3 py-2.5 text-sm whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onToggleMaintenance(vehicle)}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors duration-150"
            title={vehicle.status === 'Under Maintenance' ? 'Complete Service' : 'Send to Service'}
          >
            <Wrench className="w-4 h-4" />
          </button>
          {userRole === 'Fleet_Manager' && (
            <>
              <button
                onClick={() => onEdit(vehicle)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors duration-150"
                title="Edit Vehicle"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(vehicle._id, vehicle.plateNumber)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                title="Delete Vehicle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

export const VehiclesPage = () => {
  const dispatch = useDispatch();
  const { vehicles, loading } = useSelector((state) => state.vehicles);
  const { user } = useSelector((state) => state.auth);

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  useEffect(() => {
    // Fetch all vehicles initially
    dispatch(fetchVehicles({}));
  }, [dispatch]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    
    return vehicles.filter(v => {
      if (selectedStatus !== 'All' && v.status !== selectedStatus) return false;
      if (selectedType !== 'All' && v.type !== selectedType) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const plate = v.plateNumber?.toLowerCase() || '';
        const make = v.make?.toLowerCase() || '';
        const model = v.model?.toLowerCase() || '';
        const vin = v.vin?.toLowerCase() || '';
        
        return plate.includes(query) || make.includes(query) || model.includes(query) || vin.includes(query);
      }
      return true;
    });
  }, [vehicles, selectedStatus, selectedType, searchQuery]);

  const handleEdit = useCallback((vehicle) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setVehicleToEdit(null);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id, plate) => {
    if (window.confirm(`Are you sure you want to remove vehicle ${plate} from the fleet registry?`)) {
      await dispatch(deleteVehicle(id));
    }
  }, [dispatch]);

  const handleToggleMaintenance = useCallback(async (vehicle) => {
    const nextStatus = vehicle.status === 'Under Maintenance' ? 'Available' : 'Under Maintenance';
    await dispatch(
      updateVehicleStatus({
        id: vehicle._id,
        status: nextStatus,
        servicePerformed: nextStatus === 'Available',
      })
    );
  }, [dispatch]);

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Available', label: 'Available' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Under Maintenance', label: 'Under Maintenance' },
    { value: 'Out of Service', label: 'Out of Service' },
  ];

  const typeOptions = [
    { value: 'All', label: 'All Types' },
    { value: 'Semi-Truck', label: 'Semi-Truck' },
    { value: 'Cargo Van', label: 'Cargo Van' },
    { value: 'Refrigerated Truck', label: 'Refrigerated Truck' },
    { value: 'Electric Delivery Van', label: 'Electric Delivery Van' },
    { value: 'Flatbed', label: 'Flatbed' },
    { value: 'Box Truck', label: 'Box Truck' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#1F7A63]" /> Fleet Vehicle Registry
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your organization's vehicles, statuses, and drivers
          </p>
        </div>
        {user?.role === 'Fleet_Manager' && (
          <Button onClick={handleCreate} className="bg-[#1F7A63] hover:bg-[#186350] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Register Vehicle
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-3 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search plate, make, model, VIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm h-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusOptions}
            className="text-sm h-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={typeOptions}
            className="text-sm h-9"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header)] border-b border-[var(--border)]">
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Plate #</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Make & Model</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Year</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Type</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Capacity (kg)</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Odometer (km)</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Assigned Driver</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Hub</th>
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && vehicles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">
                    Loading vehicles...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">
                    No vehicles found matching your filters
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(vehicle => (
                  <VehicleRow
                    key={vehicle._id}
                    vehicle={vehicle}
                    onEdit={handleEdit}
                    onToggleMaintenance={handleToggleMaintenance}
                    onDelete={handleDelete}
                    userRole={user?.role}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && filteredVehicles.length > 0 && (
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>Showing {filteredVehicles.length} of {vehicles.length} vehicles</span>
        </div>
      )}

      {/* Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicleToEdit={vehicleToEdit}
      />
    </div>
  );
};

export default VehiclesPage;
