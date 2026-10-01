import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const estimateFare = createAsyncThunk(
  'pricing/estimateFare',
  async ({ pickup, dropoff, cargoWeightKg, priority, cargoType }, { rejectWithValue }) => {
    try {
      const response = await api.post('/pricing/estimate', {
        pickup,
        dropoff,
        cargoWeightKg,
        priority,
        cargoType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to estimate fare');
    }
  }
);

export const fetchPricingConfig = createAsyncThunk(
  'pricing/fetchPricingConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pricing/config');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pricing config');
    }
  }
);

export const savePricingConfig = createAsyncThunk(
  'pricing/savePricingConfig',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await api.put('/pricing/config', configData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save pricing config');
    }
  }
);

const initialState = {
  estimate: null,
  config: null,
  loading: false,
  error: null,
};

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    clearEstimate: (state) => {
      state.estimate = null;
    },
    clearPricingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(estimateFare.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(estimateFare.fulfilled, (state, action) => {
        state.loading = false;
        state.estimate = action.payload;
      })
      .addCase(estimateFare.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPricingConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricingConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchPricingConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(savePricingConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePricingConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(savePricingConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearEstimate, clearPricingError } = pricingSlice.actions;

export default pricingSlice.reducer;
