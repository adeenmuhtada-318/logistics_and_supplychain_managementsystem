import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPayrollList = createAsyncThunk(
  'payroll/fetchPayrollList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll', { params });
      return response.data.payrollList;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch payroll records.');
    }
  }
);

export const generatePayroll = createAsyncThunk(
  'payroll/generatePayroll',
  async (payloadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payroll/generate', payloadData);
      return response.data.payrollSlips;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate payroll.');
    }
  }
);

export const getPayrollById = createAsyncThunk(
  'payroll/getPayrollById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payroll/${id}`);
      return response.data.payroll;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch payslip.');
    }
  }
);

export const updatePayrollStatus = createAsyncThunk(
  'payroll/updatePayrollStatus',
  async ({ id, paymentStatus, paymentMethod, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/payroll/${id}/status`, {
        paymentStatus,
        paymentMethod,
        notes,
      });
      return response.data.payroll;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update payroll status.');
    }
  }
);

export const deletePayroll = createAsyncThunk(
  'payroll/deletePayroll',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payroll/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete payroll.');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    payrollList: [],
    currentPayslip: null,
    loading: false,
    error: null,
    statusFilter: 'All',
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setCurrentPayslip: (state, action) => {
      state.currentPayslip = action.payload;
    },
    clearPayrollError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollList.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollList = action.payload;
      })
      .addCase(fetchPayrollList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.payrollList = [...action.payload, ...state.payrollList];
      })
      // GetById
      .addCase(getPayrollById.fulfilled, (state, action) => {
        state.currentPayslip = action.payload;
      })
      // Update status
      .addCase(updatePayrollStatus.fulfilled, (state, action) => {
        state.payrollList = state.payrollList.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        if (state.currentPayslip && state.currentPayslip._id === action.payload._id) {
          state.currentPayslip = action.payload;
        }
      })
      // Delete
      .addCase(deletePayroll.fulfilled, (state, action) => {
        state.payrollList = state.payrollList.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setStatusFilter, setCurrentPayslip, clearPayrollError } = payrollSlice.actions;
export default payrollSlice.reducer;
