import { configureStore } from '@reduxjs/toolkit';
import authReducer      from '../features/auth/authSlice';
import orderReducer     from '../features/orders/orderSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

/**
 * V2.0 Streamlined Redux store — 3-role architecture (Client, Driver, Admin).
 * Mounts auth, orders, and fleet analytics for DashboardPage.
 */
export const store = configureStore({
  reducer: {
    auth:      authReducer,
    orders:    orderReducer,
    analytics: analyticsReducer,
  },
});

export default store;

