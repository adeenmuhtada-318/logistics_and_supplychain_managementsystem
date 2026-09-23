import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDispatch } from '../../features/dispatch/dispatchSlice';
import { fetchVehicles } from '../../features/fleet/vehicleSlice';
import { fetchStaffList } from '../../features/auth/authSlice';
import { fetchRoutes } from '../../features/routes/routeSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const CreateDispatchModal = React.memo(({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { vehicles } = useSelector((state) => state.vehicles);
  const { staffList } = useSelector((state) => state.auth);
  const { routes } = useSelector((state) => state.routes);

  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    routeId: '',
    cargoDescription: '',
    cargoWeightKg: 1000,
    priority: 'Standard',
    departureTime: new Date().toISOString().slice(0, 16),
    scheduledArrival: '',
    fuelExpense: 0,
    tollExpense: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchVehicles());
      dispatch(fetchStaffList({ role: 'Driver' }));
      dispatch(fetchRoutes());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (vehicles.length > 0 && !formData.vehicleId) {
      const avail = vehicles.find((v) => v.status === 'Available') || vehicles[0];
      setFormData((prev) => ({ ...prev, vehicleId: avail._id }));
    }
    if (staffList.length > 0 && !formData.driverId) {
      setFormData((prev) => ({ ...prev, driverId: staffList[0]._id }));
    }
    if (routes.length > 0 && !formData.routeId) {
      setFormData((prev) => ({
        ...prev,
        routeId: routes[0]._id,
        fuelExpense: (routes[0].fuelConsumedLiters || 80) * 1.25,
        tollExpense: routes[0].tollExpenses || 35,
      }));
    }
  }, [vehicles, staffList, routes]);

  const handleRouteChange = useCallback((e) => {
    const routeId = e.target.value;
    const selectedRoute = routes.find((r) => r._id === routeId);
    if (selectedRoute) {
      const depDate = new Date(formData.departureTime);
      const arrDate = new Date(depDate.getTime() + selectedRoute.estimatedDurationHours * 3600000);
      setFormData((prev) => ({
        ...prev,
        routeId,
        scheduledArrival: arrDate.toISOString().slice(0, 16),
        fuelExpense: Number(((selectedRoute.fuelConsumedLiters || 80) * 1.25).toFixed(2)),
        tollExpense: selectedRoute.tollExpenses || 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, routeId }));
    }
  }, [formData.departureTime, routes]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await dispatch(createDispatch(formData)).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to schedule dispatch');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v._id === formData.vehicleId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Dispatch Manifest"
      subtitle="Assign vehicle asset, certified commercial driver, and route corridor"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-md text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assigned Fleet Vehicle"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            options={vehicles.map((v) => ({
              value: v._id,
              label: `${v.plateNumber} - ${v.make} ${v.model} (${v.type}, Max ${v.capacityKg}kg) [${v.status}]`,
            }))}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />

          <Select
            label="Assigned Driver"
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            options={staffList.map((d) => ({
              value: d._id,
              label: `${d.name} (${d.licenseNumber || 'Driver'}) - Status: ${d.status}`,
            }))}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <Select
          label="Freight Route Corridor"
          name="routeId"
          value={formData.routeId}
          onChange={handleRouteChange}
          options={routes.map((r) => ({
            value: r._id,
            label: `${r.routeCode}: ${r.originHub} ➔ ${r.destinationHub} (${r.estimatedDistanceKm} km, ~${r.estimatedDurationHours} hrs)`,
          }))}
          required
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Cargo Description & Bill of Lading"
              name="cargoDescription"
              value={formData.cargoDescription}
              onChange={handleChange}
              placeholder="e.g. Industrial Electronics & Medical Sensors"
              required
              className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
            />
          </div>
          <Input
            label={`Cargo Weight (kg) ${selectedVehicle ? `[Max ${selectedVehicle.capacityKg}kg]` : ''}`}
            type="number"
            name="cargoWeightKg"
            value={formData.cargoWeightKg}
            onChange={handleChange}
            min={1}
            max={selectedVehicle?.capacityKg || 50000}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Dispatch Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={['Standard', 'Express', 'Urgent', 'Hazardous/Critical']}
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Estimated Fuel Cost ($)"
            type="number"
            name="fuelExpense"
            value={formData.fuelExpense}
            onChange={handleChange}
            step="0.01"
            min={0}
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Estimated Tolls ($)"
            type="number"
            name="tollExpense"
            value={formData.tollExpense}
            onChange={handleChange}
            step="0.01"
            min={0}
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Scheduled Departure Time"
            type="datetime-local"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Scheduled Arrival Time"
            type="datetime-local"
            name="scheduledArrival"
            value={formData.scheduledArrival}
            onChange={handleChange}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md h-9 px-4 text-sm transition-colors duration-150">
            Authorize & Dispatch Trip
          </Button>
        </div>
      </form>
    </Modal>
  );
});
