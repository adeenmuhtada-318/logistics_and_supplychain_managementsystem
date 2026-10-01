import React, { useState, useEffect } from 'react';
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
    fuelRequiredLiters: 75.0,
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

  // ── Auto-Calculation Engine ──────────────────────────────────────────────
  useEffect(() => {
    const DISTANCE_MATRIX = {
      'lahore-karachi': 1210,
      'karachi-lahore': 1210,
      'lahore-islamabad': 380,
      'islamabad-lahore': 380,
      'lahore-faisalabad': 180,
      'faisalabad-lahore': 180,
      'karachi-islamabad': 1400,
      'islamabad-karachi': 1400,
      'faisalabad-multan': 240,
      'multan-faisalabad': 240,
      'karachi-faisalabad': 1100,
      'faisalabad-karachi': 1100,
      'islamabad-faisalabad': 290,
      'faisalabad-islamabad': 290,
      'lahore-multan': 340,
      'multan-lahore': 340,
      'karachi-multan': 900,
      'multan-karachi': 900,
      'islamabad-multan': 560,
      'multan-islamabad': 560,
    };

    const origin = formData.originHub.trim().toLowerCase();
    const destination = formData.destinationHub.trim().toLowerCase();

    if (!origin || !destination) return;

    const normalize = (s) => {
      for (const key of Object.keys(DISTANCE_MATRIX)) {
        if (key.startsWith(s.split(' ')[0]) || s.includes(key.split('-')[0])) return key.split('-')[0];
      }
      return s.split(' ')[0];
    };

    const oKey = normalize(origin);
    const dKey = normalize(destination);
    const matrixKey = `${oKey}-${dKey}`;

    const distKm =
      DISTANCE_MATRIX[matrixKey] ??
      Math.floor(Math.random() * (800 - 100 + 1)) + 100;

    const transitHours = parseFloat((distKm / 60).toFixed(2));
    const fuelLiters = parseFloat((distKm * 0.25).toFixed(2));

    setFormData((prev) => ({
      ...prev,
      estimatedDistanceKm: distKm,
      estimatedDurationHours: transitHours,
      fuelRequiredLiters: fuelLiters,
    }));
  }, [formData.originHub, formData.destinationHub]);
  // ─────────────────────────────────────────────────────────────────────────

  const calcDistance = Number(formData.estimatedDistanceKm) || 0;
  const calcTransitHours = Number(formData.estimatedDurationHours) || 0;
  const calcFuelLiters = Number(formData.fuelRequiredLiters) || 0;
  const calcTransitDisplay =
    calcTransitHours >= 1
      ? `${Math.floor(calcTransitHours)}h ${Math.round((calcTransitHours % 1) * 60)}m`
      : `${Math.round(calcTransitHours * 60)}m`;

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

        {/* ── Automated Route Metrics Panel ──────────────────────────── */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '8px',
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '3px',
              height: '100%',
              background: 'linear-gradient(180deg, #00E676 0%, #00BFA5 100%)',
              borderRadius: '8px 0 0 8px',
            }}
          />

          <div style={{ paddingLeft: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#00E676',
                  fontFamily: 'monospace',
                }}
              >
                Automated Route Metrics
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '8px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#9AA3A8',
                  fontFamily: 'monospace',
                  background: '#242424',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '1px 6px',
                }}
              >
                AUTO-CALC
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {/* Distance */}
              <div
                style={{
                  background: '#1E1E1E',
                  border: '1px solid #2A2A2A',
                  borderRadius: '6px',
                  padding: '10px 12px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '8.5px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9AA3A8',
                    marginBottom: '6px',
                    fontFamily: 'monospace',
                  }}
                >
                  Distance
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#00E676',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}
                >
                  {calcDistance.toLocaleString()}
                </span>
                <span style={{ fontSize: '9px', color: '#9AA3A8', fontFamily: 'monospace' }}>
                  km
                </span>
              </div>

              {/* Transit Time */}
              <div
                style={{
                  background: '#1E1E1E',
                  border: '1px solid #2A2A2A',
                  borderRadius: '6px',
                  padding: '10px 12px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '8.5px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9AA3A8',
                    marginBottom: '6px',
                    fontFamily: 'monospace',
                  }}
                >
                  Transit Time
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#E0E0E0',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}
                >
                  {calcTransitDisplay}
                </span>
                <span style={{ fontSize: '9px', color: '#9AA3A8', fontFamily: 'monospace' }}>
                  @ 60 km/h avg
                </span>
              </div>

              {/* Fuel Required */}
              <div
                style={{
                  background: '#1E1E1E',
                  border: '1px solid #2A2A2A',
                  borderRadius: '6px',
                  padding: '10px 12px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '8.5px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9AA3A8',
                    marginBottom: '6px',
                    fontFamily: 'monospace',
                  }}
                >
                  Fuel Required
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFB300',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}
                >
                  {calcFuelLiters.toLocaleString()}
                </span>
                <span style={{ fontSize: '9px', color: '#9AA3A8', fontFamily: 'monospace' }}>
                  liters (0.25 L/km)
                </span>
              </div>
            </div>

            <p
              style={{
                marginTop: '10px',
                fontSize: '9px',
                color: '#555',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
            >
              ⚡ Values auto-computed from origin &amp; destination. Matrix-matched for PK hubs; random fallback otherwise.
            </p>
          </div>
        </div>
        {/* ──────────────────────────────────────────────────────────── */}

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
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
              ~{calcFuelLiters.toFixed(1)} Liters
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block font-semibold text-[10px] uppercase">
              Estimated Carbon Footprint
            </span>
            <span className="font-mono text-[#1F7A63] font-bold text-sm">
              ~{(calcFuelLiters * 2.68).toFixed(1)} kg CO2
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
