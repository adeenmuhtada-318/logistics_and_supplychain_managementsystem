import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/routes', { params });
      return response.data.routes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch routes.');
    }
  }
);

export const createRoute = createAsyncThunk(
  'routes/createRoute',
  async (routeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/routes', routeData);
      return response.data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create route.');
    }
  }
);

export const updateRoute = createAsyncThunk(
  'routes/updateRoute',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/routes/${id}`, data);
      return response.data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update route.');
    }
  }
);

export const deleteRoute = createAsyncThunk(
  'routes/deleteRoute',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/routes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete route.');
    }
  }
);

const routeSlice = createSlice({
  name: 'routes',
  initialState: {
    routes: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRouteError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        state.routes.unshift(action.payload);
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        state.routes = state.routes.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.routes = state.routes.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearRouteError } = routeSlice.actions;
export default routeSlice.reducer;
