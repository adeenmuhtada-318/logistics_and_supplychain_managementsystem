import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import { Truck, Lock, Mail, Zap, LogIn, AlertCircle } from 'lucide-react';

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const BG    = '#0E0E0E';
const CARD  = '#161616';
const BORD  = '#2A2A2A';
const DIM   = '#9AA3A8';
const GREEN = '#00E676';

/* ─── Role-based redirect helper ────────────────────────────────────────── */
const ROLE_HOME = {
  Client: '/client/dashboard',
  Driver: '/driver/terminal',
  Admin:  '/dashboard',
};

/* ─── Quick demo accounts (V2.0 roles) ──────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    label:    'Client Portal',
    email:    'client@fleetcore.local',
    password: 'Client@123456',
    color:    GREEN,
    desc:     'B2B Order Placement',
    role:     'Client',
  },
  {
    label:    'Driver Terminal',
    email:    'driver@fleetcore.local',
    password: 'Driver@123456',
    color:    '#448AFF',
    desc:     'Trip Accept / Decline',
    role:     'Driver',
  },
  {
    label:    'Admin Panel',
    email:    'admin@fleetcore.local',
    password: 'Admin@123456',
    color:    '#FF9800',
    desc:     'System Oversight',
    role:     'Admin',
  },
];

/* ─── Input component ────────────────────────────────────────────────────── */
const AuthInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    <Icon size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: DIM, pointerEvents: 'none' }} />
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box',
        height: '40px', paddingLeft: '36px', paddingRight: '12px',
        background: '#1A1A1A', border: `1px solid ${BORD}`,
        borderRadius: '8px', color: '#E0E0E0', fontSize: '13px',
        fontFamily: "'Inter', system-ui, sans-serif", outline: 'none',
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) => { e.target.style.borderColor = GREEN + '88'; }}
      onBlur={(e)  => { e.target.style.borderColor = BORD; }}
    />
  </div>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
export const LoginPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isAuthenticated, loading, error, user } = useSelector((s) => s.auth);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Role-based redirect after login
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(ROLE_HOME[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    await dispatch(loginUser({ email, password }));
  }, [dispatch, email, password]);

  const handleQuickDemo = useCallback(async (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    await dispatch(loginUser({ email: demo.email, password: demo.password }));
  }, [dispatch]);

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', padding: '12px', borderRadius: '14px',
            background: GREEN + '18', border: `1px solid ${GREEN}30`, marginBottom: '14px',
          }}>
            <Truck size={28} style={{ color: GREEN }} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#E0E0E0' }}>
            FleetCore<span style={{ color: GREEN }}>.io</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: DIM, fontFamily: 'monospace' }}>
            Logistics & Supply Chain Management V2.0
          </p>
        </div>

        {/* Quick Demo Buttons */}
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Zap size={13} style={{ color: '#FFB300' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FFB300', fontFamily: 'monospace' }}>
              Quick Demo Login
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => handleQuickDemo(acct)}
                disabled={loading}
                style={{
                  padding: '10px 8px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                  background: '#1A1A1A', border: `1px solid ${BORD}`, textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s', opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = acct.color + '50'; e.currentTarget.style.background = '#1F1F1F'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORD; e.currentTarget.style.background = '#1A1A1A'; }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: acct.color, marginBottom: '2px' }}>{acct.label}</span>
                <span style={{ fontSize: '9px', color: DIM, display: 'block', fontFamily: 'monospace' }}>{acct.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: '10px', padding: '20px' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 12px', marginBottom: '14px',
                background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.25)',
                borderRadius: '7px',
              }}>
                <AlertCircle size={13} style={{ color: '#FF5252', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#FF5252', fontFamily: 'monospace' }}>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: DIM, marginBottom: '6px', fontFamily: 'monospace' }}>
                Email Address
              </label>
              <AuthInput
                icon={Mail}
                type="email"
                placeholder="e.g. client@fleetcore.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: DIM, marginBottom: '6px', fontFamily: 'monospace' }}>
                Password
              </label>
              <AuthInput
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              style={{
                width: '100%', height: '42px', borderRadius: '8px', border: 'none',
                background: loading ? '#1A1A1A' : `linear-gradient(135deg, ${GREEN}, #00C853)`,
                color: loading ? DIM : '#0A0A0A', fontWeight: 800, fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⚙</span>
                  Signing In…
                </>
              ) : (
                <>
                  <LogIn size={15} /> Sign In
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: DIM }}>
            New Client?{' '}
            <Link to="/client/register" style={{ color: GREEN, fontWeight: 700, textDecoration: 'none' }}>
              Register your business
            </Link>
            {' '}·{' '}
            <Link to="/register" style={{ color: '#448AFF', fontWeight: 700, textDecoration: 'none' }}>
              Driver sign-up
            </Link>
          </div>
        </div>

        {/* Role guide pill */}
        <div style={{
          marginTop: '16px', padding: '10px 14px', background: CARD,
          border: `1px solid ${BORD}`, borderRadius: '8px',
          display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {DEMO_ACCOUNTS.map((a) => (
            <span key={a.role} style={{ fontSize: '10px', fontFamily: 'monospace', color: a.color }}>
              {a.role} → {ROLE_HOME[a.role]}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
