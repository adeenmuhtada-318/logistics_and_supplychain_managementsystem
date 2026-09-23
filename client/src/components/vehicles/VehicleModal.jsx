import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createVehicle, updateVehicle } from '../../features/fleet/vehicleSlice';
import { fetchStaffList } from '../../features/auth/authSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const VehicleModal = React.memo(({ isOpen, onClose, vehicleToEdit = null }) => {
  const dispatch = useDispatch();
  const { staffList } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    plateNumber: '',
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Cargo Van',
    capacityKg: 2000,
    fuelType: 'Diesel',
    currentOdometerKm: 0,
    currentHubLocation: 'Chicago Central Depot, IL',
    assignedDriver: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchStaffList({ role: 'Driver' }));
  }, [dispatch]);

  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        plateNumber: vehicleToEdit.plateNumber || '',
        vin: vehicleToEdit.vin || '',
        make: vehicleToEdit.make || '',
        model: vehicleToEdit.model || '',
        year: vehicleToEdit.year || 2024,
        type: vehicleToEdit.type || 'Cargo Van',
        capacityKg: vehicleToEdit.capacityKg || 2000,
        fuelType: vehicleToEdit.fuelType || 'Diesel',
        currentOdometerKm: vehicleToEdit.currentOdometerKm || 0,
        currentHubLocation: vehicleToEdit.currentHubLocation || 'Chicago Central Depot, IL',
        assignedDriver: vehicleToEdit.assignedDriver?._id || vehicleToEdit.assignedDriver || '',
        notes: vehicleToEdit.notes || '',
      });
    } else {
      setFormData({
        plateNumber: '',
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'Cargo Van',
        capacityKg: 2000,
        fuelType: 'Diesel',
        currentOdometerKm: 0,
        currentHubLocation: 'Chicago Central Depot, IL',
        assignedDriver: '',
        notes: '',
      });
    }
    setError('');
  }, [vehicleToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (vehicleToEdit) {
        await dispatch(updateVehicle({ id: vehicleToEdit._id, data: formData })).unwrap();
      } else {
        await dispatch(createVehicle(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const driverOptions = [
    { value: '', label: 'Unassigned / Available for Dispatch' },
    ...staffList.map((d) => ({
      value: d._id,
      label: `${d.name} (${d.licenseNumber || 'CDL Driver'}) - ${d.status}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicleToEdit ? 'Edit Vehicle' : 'Register Vehicle'}
      subtitle="Vehicle specifications and payload configuration"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-md text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="License Plate Number"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            placeholder="e.g. FLT-9042-IL"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Vehicle VIN"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="e.g. 1FTFW1ED8MFB12345"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="e.g. Freightliner"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g. Cascadia"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Year"
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min={1990}
            max={2030}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Vehicle Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              'Cargo Van',
              'Semi-Truck',
              'Flatbed',
              'Refrigerated Truck',
              'Electric Delivery Van',
              'Box Truck',
            ]}
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Select
            label="Fuel / Powertrain"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            options={['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'CNG']}
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Payload Capacity (kg)"
            type="number"
            name="capacityKg"
            value={formData.capacityKg}
            onChange={handleChange}
            min={100}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current Odometer (km)"
            type="number"
            name="currentOdometerKm"
            value={formData.currentOdometerKm}
            onChange={handleChange}
            min={0}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Current Hub / Depot Location"
            name="currentHubLocation"
            value={formData.currentHubLocation}
            onChange={handleChange}
            placeholder="e.g. Chicago Central Depot, IL"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <Select
          label="Assigned Primary Driver"
          name="assignedDriver"
          value={formData.assignedDriver}
          onChange={handleChange}
          options={driverOptions}
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <Input
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="e.g. Equipped with refrigeration monitoring sensor and tail lift."
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md h-9 px-4 text-sm transition-colors duration-150">
            {vehicleToEdit ? 'Save Vehicle Changes' : 'Register Vehicle Asset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
