import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDispatches = createAsyncThunk(
  'dispatches/fetchDispatches',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/dispatches', { params });
      return response.data.dispatches;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dispatches.');
    }
  }
);

export const createDispatch = createAsyncThunk(
  'dispatches/createDispatch',
  async (dispatchData, { rejectWithValue }) => {
    try {
      const response = await api.post('/dispatches', dispatchData);
      return response.data.dispatch;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create dispatch.');
    }
  }
);

export const getDispatchById = createAsyncThunk(
  'dispatches/getDispatchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dispatches/${id}`);
      return response.data.dispatch;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dispatch details.');
    }
  }
);

export const updateDispatchStatus = createAsyncThunk(
  'dispatches/updateDispatchStatus',
  async ({ id, status, location, notes, fuelExpense, tollExpense }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/dispatches/${id}/status`, {
        status,
        location,
        notes,
        fuelExpense,
        tollExpense,
      });
      return response.data.dispatch;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update dispatch status.');
    }
  }
);

export const reportDispatchIncident = createAsyncThunk(
  'dispatches/reportDispatchIncident',
  async ({ id, incidentNotes, location }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/dispatches/${id}/incident`, {
        incidentNotes,
        location,
      });
      return response.data.dispatch;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to report incident.');
    }
  }
);

export const deleteDispatch = createAsyncThunk(
  'dispatches/deleteDispatch',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/dispatches/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete dispatch.');
    }
  }
);

const dispatchSlice = createSlice({
  name: 'dispatches',
  initialState: {
    dispatches: [],
    currentDispatch: null,
    loading: false,
    error: null,
    statusFilter: 'All',
    priorityFilter: 'All',
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setCurrentDispatch: (state, action) => {
      state.currentDispatch = action.payload;
    },
    clearDispatchError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDispatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatches.fulfilled, (state, action) => {
        state.loading = false;
        state.dispatches = action.payload;
      })
      .addCase(fetchDispatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createDispatch.fulfilled, (state, action) => {
        state.dispatches.unshift(action.payload);
      })
      // GetById
      .addCase(getDispatchById.fulfilled, (state, action) => {
        state.currentDispatch = action.payload;
      })
      // Update status
      .addCase(updateDispatchStatus.fulfilled, (state, action) => {
        state.dispatches = state.dispatches.map((d) =>
          d._id === action.payload._id ? action.payload : d
        );
        if (state.currentDispatch && state.currentDispatch._id === action.payload._id) {
          state.currentDispatch = action.payload;
        }
      })
      // Incident
      .addCase(reportDispatchIncident.fulfilled, (state, action) => {
        state.dispatches = state.dispatches.map((d) =>
          d._id === action.payload._id ? action.payload : d
        );
        if (state.currentDispatch && state.currentDispatch._id === action.payload._id) {
          state.currentDispatch = action.payload;
        }
      })
      // Delete
      .addCase(deleteDispatch.fulfilled, (state, action) => {
        state.dispatches = state.dispatches.filter((d) => d._id !== action.payload);
      });
  },
});

export const { setStatusFilter, setPriorityFilter, setCurrentDispatch, clearDispatchError } =
  dispatchSlice.actions;
export default dispatchSlice.reducer;
