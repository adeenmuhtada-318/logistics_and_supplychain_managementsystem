import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearAuthError } from '../features/auth/authSlice';
import { Truck, Lock, Mail, User, Phone, Award, UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Driver',
    phone: '',
    licenseNumber: '',
    hourlyRate: 30.0,
    shiftType: 'Morning',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    await dispatch(registerUser(formData));
  }, [dispatch, formData]);

  const inputCls = 'h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] placeholder:text-coolgray focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors duration-150';
  const labelCls = 'block text-xs font-medium text-[var(--text-secondary)] mb-1';
  const selectCls = 'h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors duration-150';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] transition-colors duration-150">
      <div className="w-full max-w-lg space-y-5">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2.5 rounded-md bg-brand-500 text-white">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Register Staff Profile
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Onboard Drivers, Dispatchers, and Logistics Staff
          </p>
        </div>

        {/* Form */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-5 transition-colors duration-150">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-700 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                  <input name="name" placeholder="Robert Vance" value={formData.name} onChange={handleChange} required className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                  <input type="email" name="email" placeholder="robert@logistics.local" value={formData.email} onChange={handleChange} required className={`${inputCls} pl-9`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Password (min 6)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Organization Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={selectCls}>
                  <option value="Driver">Commercial Driver</option>
                  <option value="Dispatcher">Freight Dispatcher</option>
                  <option value="Accountant">Financial Accountant</option>
                  <option value="Fleet_Manager">Fleet Manager</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                  <input name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>CDL / License #</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                  <input name="licenseNumber" placeholder="CDL-A-123456" value={formData.licenseNumber} onChange={handleChange} className={`${inputCls} pl-9`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Hourly Rate ($/hr)</label>
                <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} step="0.5" min={0} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Assigned Shift</label>
                <select name="shiftType" value={formData.shiftType} onChange={handleChange} className={selectCls}>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Long-Haul">Long-Haul</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Create Account
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors duration-150">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
