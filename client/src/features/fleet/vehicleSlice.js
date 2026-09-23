import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/vehicles', { params });
      return response.data.vehicles;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch fleet vehicles.');
    }
  }
);

export const createVehicle = createAsyncThunk(
  'vehicles/createVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return response.data.vehicle;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register vehicle.');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vehicles/${id}`, data);
      return response.data.vehicle;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update vehicle.');
    }
  }
);

export const updateVehicleStatus = createAsyncThunk(
  'vehicles/updateVehicleStatus',
  async ({ id, status, currentHubLocation, currentOdometerKm, notes, servicePerformed }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/vehicles/${id}/status`, {
        status,
        currentHubLocation,
        currentOdometerKm,
        notes,
        servicePerformed,
      });
      return response.data.vehicle;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status.');
    }
  }
);

export const assignVehicleDriver = createAsyncThunk(
  'vehicles/assignVehicleDriver',
  async ({ id, driverId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/vehicles/${id}/assign-driver`, { driverId });
      return response.data.vehicle;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to assign driver.');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/vehicles/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    vehicles: [],
    loading: false,
    error: null,
    statusFilter: 'All',
    typeFilter: 'All',
    searchQuery: '',
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearVehicleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.vehicles.unshift(action.payload);
      })
      // Update
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.map((v) =>
          v._id === action.payload._id ? action.payload : v
        );
      })
      // Status update
      .addCase(updateVehicleStatus.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.map((v) =>
          v._id === action.payload._id ? action.payload : v
        );
      })
      // Assign Driver
      .addCase(assignVehicleDriver.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.map((v) =>
          v._id === action.payload._id ? action.payload : v
        );
      })
      // Delete
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter((v) => v._id !== action.payload);
      });
  },
});

export const { setStatusFilter, setTypeFilter, setSearchQuery, clearVehicleError } =
  vehicleSlice.actions;
export default vehicleSlice.reducer;
