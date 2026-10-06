import api from './api';

/**
 * Thin cached client for the backend /api/locations endpoints
 * (provinces -> cities -> areas, served from server/data/pakistanLocations.js).
 */
const cache = { provinces: null, cities: {}, areas: {} };

export const fetchProvinces = async () => {
  if (cache.provinces) return cache.provinces;
  const res = await api.get('/locations/provinces');
  cache.provinces = res.data?.data || [];
  return cache.provinces;
};

export const fetchCities = async (province) => {
  if (!province) return [];
  if (cache.cities[province]) return cache.cities[province];
  const res = await api.get('/locations/cities', { params: { province } });
  cache.cities[province] = res.data?.data || [];
  return cache.cities[province];
};

export const fetchAreas = async (province, city) => {
  if (!province || !city) return [];
  const key = `${province}::${city}`;
  if (cache.areas[key]) return cache.areas[key];
  const res = await api.get('/locations/areas', { params: { province, city } });
  cache.areas[key] = res.data?.data || [];
  return cache.areas[key];
};
