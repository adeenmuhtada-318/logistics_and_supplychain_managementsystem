import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProvinces, fetchCities, fetchAreas } from '../../features/locations/locationSlice';

export const PakistanLocationDropdown = ({
  value = { province: '', city: '', area: '' },
  onChange,
  required = false,
  label,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const { provinces = [], cities = [], areas = [], loading } = useSelector((state) => state.locations || {});

  useEffect(() => {
    if (provinces.length === 0) {
      dispatch(fetchProvinces());
    }
  }, [dispatch, provinces.length]);

  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    onChange({ province: prov, city: '', area: '' });
    if (prov) {
      dispatch(fetchCities(prov));
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    onChange({ ...value, city, area: '' });
    if (city) {
      dispatch(fetchAreas({ province: value.province, city }));
    }
  };

  const handleAreaChange = (e) => {
    const area = e.target.value;
    onChange({ ...value, area });
  };

  return (
    <div className="w-full">
      {label && <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">{label}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <select
            value={value.province}
            onChange={handleProvinceChange}
            required={required}
            disabled={disabled || loading}
            className="h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#00E676]/40 focus:border-[#00E676] transition-colors duration-150 appearance-none"
          >
            <option value="">Select Province</option>
            {provinces.map((prov) => (
              <option key={prov.id || prov} value={prov.name || prov}>{prov.name || prov}</option>
            ))}
          </select>
          {loading && !value.province && (
            <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        <div className="relative">
          <select
            value={value.city}
            onChange={handleCityChange}
            required={required}
            disabled={disabled || !value.province || loading}
            className="h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#00E676]/40 focus:border-[#00E676] transition-colors duration-150 appearance-none"
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.id || city} value={city.name || city}>{city.name || city}</option>
            ))}
          </select>
          {loading && value.province && !value.city && (
            <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        <div className="relative">
          <select
            value={value.area}
            onChange={handleAreaChange}
            required={required}
            disabled={disabled || !value.city || loading}
            className="h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#00E676]/40 focus:border-[#00E676] transition-colors duration-150 appearance-none"
          >
            <option value="">Select Area</option>
            {areas.map((area) => (
              <option key={area.id || area} value={area.name || area}>{area.name || area}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
