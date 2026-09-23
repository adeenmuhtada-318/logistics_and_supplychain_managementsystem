import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import vehicleReducer from '../features/fleet/vehicleSlice';
import dispatchReducer from '../features/dispatch/dispatchSlice';
import routeReducer from '../features/routes/routeSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import payrollReducer from '../features/payroll/payrollSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    dispatches: dispatchReducer,
    routes: routeReducer,
    attendance: attendanceReducer,
    payroll: payrollReducer,
    analytics: analyticsReducer,
  },
});

export default store;
