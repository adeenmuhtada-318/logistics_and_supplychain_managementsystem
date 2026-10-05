import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place order');
    }
  }
);

export const respondToOffer = createAsyncThunk(
  'orders/respondToOffer',
  async ({ orderId, response }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/orders/${orderId}/driver-response`, { response });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to offer');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'orders/confirmPayment',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/orders/${orderId}/confirm-payment`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, location, notes }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status, location, notes });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`, { reason });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  submitting: false,
  error: null,
  count: 0,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.orders = payload.data || payload.orders || [];
        state.count  = payload.count || state.orders.length;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.submitting = false;
        state.orders.push(action.payload);
        state.count += 1;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(respondToOffer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(respondToOffer.fulfilled, (state, action) => {
        state.submitting = false;
        if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(respondToOffer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.submitting = false;
        if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.submitting = false;
        if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  }
});

export const { clearSelectedOrder, clearOrderError } = orderSlice.actions;

export default orderSlice.reducer;
