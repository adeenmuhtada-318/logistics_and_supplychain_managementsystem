import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const savedToken = localStorage.getItem('token');
const savedUser  = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

// ── Async Thunks ─────────────────────────────────────────────────────────────

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

export const registerDriver = createAsyncThunk(
  'auth/registerDriver',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Driver registration failed.');
    }
  }
);

export const registerClient = createAsyncThunk(
  'auth/registerClient',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register-client', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Client registration failed.');
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

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            savedUser,
    token:           savedToken || null,
    isAuthenticated: !!savedToken,
    loading:         false,
    error:           null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending  = (state) => { state.loading = true;  state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };
    const handleAuthFulfilled = (state, action) => {
      state.loading         = false;
      state.isAuthenticated = true;
      state.token           = action.payload.token;
      state.user            = action.payload.user;
    };

    builder
      // Login
      .addCase(loginUser.pending,   handlePending)
      .addCase(loginUser.fulfilled, handleAuthFulfilled)
      .addCase(loginUser.rejected,  handleRejected)
      // Register Driver
      .addCase(registerDriver.pending,   handlePending)
      .addCase(registerDriver.fulfilled, handleAuthFulfilled)
      .addCase(registerDriver.rejected,  handleRejected)
      // Register Client
      .addCase(registerClient.pending,   handlePending)
      .addCase(registerClient.fulfilled, handleAuthFulfilled)
      .addCase(registerClient.rejected,  handleRejected)
      // GetMe
      .addCase(getMe.fulfilled, (state, action) => {
        state.user            = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
