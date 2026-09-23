import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import { Truck, Lock, Mail, Zap, LogIn } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Fleet Manager', email: 'manager@logistics.local', password: 'Manager@123456', color: 'text-brand-500', desc: 'Full System Admin' },
  { label: 'Dispatcher', email: 'dispatcher@logistics.local', password: 'Dispatcher@123456', color: 'text-violet-500 dark:text-violet-400', desc: 'Routes & Dispatches' },
  { label: 'Driver (John)', email: 'driver.john@logistics.local', password: 'Driver@123456', color: 'text-emerald-600 dark:text-emerald-400', desc: 'Time-Clock & Shifts' },
  { label: 'Accountant', email: 'accountant@logistics.local', password: 'Accountant@123456', color: 'text-amber-600 dark:text-amber-400', desc: 'Payroll & Wages' },
];

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    await dispatch(loginUser({ email, password }));
  }, [dispatch, email, password]);

  const handleQuickDemo = useCallback(async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    await dispatch(loginUser({ email: demoEmail, password: demoPass }));
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] transition-colors duration-150">
      <div className="w-full max-w-md space-y-5">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2.5 rounded-md bg-brand-500 text-white">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            FleetCore<span className="text-brand-500">.io</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Logistics & Fleet Management System
          </p>
        </div>

        {/* Quick Demo */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4 transition-colors duration-150">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Quick Demo Login
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => handleQuickDemo(acct.email, acct.password)}
                disabled={loading}
                className="p-2 rounded-md bg-[var(--table-header)] hover:bg-[var(--table-row-hover)] border border-[var(--border)] text-left transition-colors duration-150 disabled:opacity-50"
              >
                <span className={`text-xs font-semibold block ${acct.color}`}>
                  {acct.label}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block">
                  {acct.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-5 transition-colors duration-150">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-700 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                <input
                  type="email"
                  placeholder="e.g. manager@logistics.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-coolgray focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors duration-150"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coolgray" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-9 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-coolgray focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors duration-150"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Sign In
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-[var(--text-secondary)]">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors duration-150">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
