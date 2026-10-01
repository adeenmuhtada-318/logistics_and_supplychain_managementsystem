import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProvinces = createAsyncThunk(
  'locations/fetchProvinces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/locations/provinces');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch provinces');
    }
  }
);

export const fetchCities = createAsyncThunk(
  'locations/fetchCities',
  async (province, { rejectWithValue }) => {
    try {
      const response = await api.get('/locations/cities', { params: { province } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cities');
    }
  }
);

export const fetchAreas = createAsyncThunk(
  'locations/fetchAreas',
  async ({ province, city }, { rejectWithValue }) => {
    try {
      const response = await api.get('/locations/areas', { params: { province, city } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch areas');
    }
  }
);

const initialState = {
  provinces: [],
  cities: [],
  areas: [],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    resetCities: (state) => {
      state.cities = [];
    },
    resetAreas: (state) => {
      state.areas = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetCities, resetAreas } = locationSlice.actions;

export default locationSlice.reducer;
