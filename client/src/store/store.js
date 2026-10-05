import { configureStore } from '@reduxjs/toolkit';
import authReducer  from '../features/auth/authSlice';
import orderReducer from '../features/orders/orderSlice';

/**
 * V2.0 Streamlined Redux store — 3-role architecture (Client, Driver, Admin).
 * Legacy slices (vehicles, dispatches, routes, attendance, payroll) removed.
 * Only the two slices required by the new flows remain.
 */
export const store = configureStore({
  reducer: {
    auth:   authReducer,
    orders: orderReducer,
  },
});

export default store;
