import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed. Check credentials.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed.');
    }
  }
);

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired.');
  }
});

export const fetchStaffList = createAsyncThunk(
  'auth/fetchStaffList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/staff', { params });
      return response.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff.');
    }
  }
);

export const updateStaffStatus = createAsyncThunk(
  'auth/updateStaffStatus',
  async ({ id, status, hourlyRate, shiftType }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/auth/staff/${id}/status`, {
        status,
        hourlyRate,
        shiftType,
      });
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update staff status.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
    staffList: [],
    staffLoading: false,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetMe
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Staff list
      .addCase(fetchStaffList.pending, (state) => {
        state.staffLoading = true;
      })
      .addCase(fetchStaffList.fulfilled, (state, action) => {
        state.staffLoading = false;
        state.staffList = action.payload;
      })
      .addCase(fetchStaffList.rejected, (state) => {
        state.staffLoading = false;
      })
      // Update Staff Status
      .addCase(updateStaffStatus.fulfilled, (state, action) => {
        state.staffList = state.staffList.map((s) =>
          s._id === action.payload._id ? action.payload : s
        );
        if (state.user && state.user.id === action.payload._id) {
          state.user = { ...state.user, ...action.payload };
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
