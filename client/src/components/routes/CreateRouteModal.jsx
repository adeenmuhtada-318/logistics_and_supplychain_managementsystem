import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRoute } from '../../features/routes/routeSlice';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, Trash2, MapPin } from 'lucide-react';

export const CreateRouteModal = React.memo(({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    routeName: '',
    originHub: '',
    destinationHub: '',
    estimatedDistanceKm: 300,
    estimatedDurationHours: 4.0,
    tollExpenses: 25.0,
    waypoints: [
      { name: 'Midway Staging Hub', order: 1, estimatedStopMinutes: 20 },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddWaypoint = () => {
    setFormData((prev) => ({
      ...prev,
      waypoints: [
        ...prev.waypoints,
        {
          name: '',
          order: prev.waypoints.length + 1,
          estimatedStopMinutes: 20,
        },
      ],
    }));
  };

  const handleRemoveWaypoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index),
    }));
  };

  const handleWaypointChange = (index, field, val) => {
    setFormData((prev) => {
      const updated = [...prev.waypoints];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, waypoints: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await dispatch(createRoute(formData)).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to create route corridor');
    } finally {
      setLoading(false);
    }
  };

  const distance = Number(formData.estimatedDistanceKm) || 0;
  const estimatedFuelLiters = ((distance / 100) * 30).toFixed(1);
  const estimatedCO2 = (estimatedFuelLiters * 2.68).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Route Corridor"
      subtitle="Add a new route with distance, waypoints, and cost estimates"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-md text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <Input
          label="Corridor Name"
          name="routeName"
          value={formData.routeName}
          onChange={handleChange}
          placeholder="e.g. Great Lakes Freight Highway (Chicago - Detroit)"
          required
          className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Origin Hub / Depot Location"
            name="originHub"
            value={formData.originHub}
            onChange={handleChange}
            placeholder="e.g. Chicago Central Depot, IL"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Destination Hub / Depot Location"
            name="destinationHub"
            value={formData.destinationHub}
            onChange={handleChange}
            placeholder="e.g. Detroit Metro Gateway, MI"
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Estimated Distance (km)"
            type="number"
            name="estimatedDistanceKm"
            value={formData.estimatedDistanceKm}
            onChange={handleChange}
            min={1}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Estimated Transit (Hours)"
            type="number"
            name="estimatedDurationHours"
            value={formData.estimatedDurationHours}
            onChange={handleChange}
            step="0.1"
            min={0.1}
            required
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
          <Input
            label="Toll Fees ($)"
            type="number"
            name="tollExpenses"
            value={formData.tollExpenses}
            onChange={handleChange}
            step="0.01"
            min={0}
            className="h-9 rounded-md border-[var(--input-border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
          />
        </div>

        <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-md grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[var(--text-secondary)] block font-semibold text-[10px] uppercase">
              Est. Diesel Fuel Consumption
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">
              ~{estimatedFuelLiters} Liters
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block font-semibold text-[10px] uppercase">
              Estimated Carbon Footprint
            </span>
            <span className="font-mono text-[#1F7A63] font-bold text-sm">
              ~{estimatedCO2} kg CO2
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Intermediate Waypoints & Staging Stops
            </span>
            <button
              type="button"
              onClick={handleAddWaypoint}
              className="text-xs font-bold text-[#1F7A63] hover:text-[#186350] flex items-center gap-1 transition-colors duration-150"
            >
              <Plus className="w-3.5 h-3.5" /> Add Stop
            </button>
          </div>

          <div className="space-y-2">
            {formData.waypoints.map((wp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="p-2 text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4 text-[#1F7A63]" />
                </span>
                <input
                  type="text"
                  value={wp.name}
                  onChange={(e) => handleWaypointChange(idx, 'name', e.target.value)}
                  placeholder={`Waypoint #${idx + 1} Name / Inspection post`}
                  className="flex-1 h-9 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
                  required
                />
                <input
                  type="number"
                  value={wp.estimatedStopMinutes}
                  onChange={(e) =>
                    handleWaypointChange(idx, 'estimatedStopMinutes', Number(e.target.value))
                  }
                  placeholder="Mins"
                  className="w-20 h-9 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2 text-sm text-center text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors duration-150"
                  min={1}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveWaypoint(idx)}
                  className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md h-9 text-sm">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-[#1F7A63] hover:bg-[#186350] text-white rounded-md h-9 px-4 text-sm transition-colors duration-150">
            Save Route Corridor
          </Button>
        </div>
      </form>
    </Modal>
  );
});
