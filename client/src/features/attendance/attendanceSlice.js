import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAttendanceLogs = createAsyncThunk(
  'attendance/fetchAttendanceLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance', { params });
      return response.data.logs;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attendance logs.');
    }
  }
);

export const checkTodayAttendance = createAsyncThunk(
  'attendance/checkTodayAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to check status.');
    }
  }
);

export const clockInDriver = createAsyncThunk(
  'attendance/clockInDriver',
  async ({ shiftType, notes, driverId } = {}, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/clock-in', { shiftType, notes, driverId });
      return response.data.attendance;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Clock-in failed.');
    }
  }
);

export const clockOutDriver = createAsyncThunk(
  'attendance/clockOutDriver',
  async ({ notes, driverId } = {}, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/clock-out', { notes, driverId });
      return response.data.attendance;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Clock-out failed.');
    }
  }
);

export const verifyTimesheet = createAsyncThunk(
  'attendance/verifyTimesheet',
  async ({ id, status, regularHours, overtimeHours, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/attendance/${id}/verify`, {
        status,
        regularHours,
        overtimeHours,
        notes,
      });
      return response.data.log;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Timesheet verification failed.');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    attendanceLogs: [],
    isClockedIn: false,
    activeSession: null,
    todayLog: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchAttendanceLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceLogs = action.payload;
      })
      .addCase(fetchAttendanceLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check today
      .addCase(checkTodayAttendance.fulfilled, (state, action) => {
        state.isClockedIn = action.payload.isClockedIn;
        state.activeSession = action.payload.activeSession;
        state.todayLog = action.payload.todayLog;
      })
      // Clock In
      .addCase(clockInDriver.fulfilled, (state, action) => {
        state.isClockedIn = true;
        state.activeSession = action.payload;
        state.attendanceLogs.unshift(action.payload);
      })
      .addCase(clockInDriver.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Clock Out
      .addCase(clockOutDriver.fulfilled, (state, action) => {
        state.isClockedIn = false;
        state.activeSession = null;
        state.todayLog = action.payload;
        state.attendanceLogs = state.attendanceLogs.map((log) =>
          log._id === action.payload._id ? action.payload : log
        );
      })
      .addCase(clockOutDriver.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Verify
      .addCase(verifyTimesheet.fulfilled, (state, action) => {
        state.attendanceLogs = state.attendanceLogs.map((log) =>
          log._id === action.payload._id ? action.payload : log
        );
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
