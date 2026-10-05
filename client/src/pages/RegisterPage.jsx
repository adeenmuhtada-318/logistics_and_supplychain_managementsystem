import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerDriver, clearAuthError } from '../features/auth/authSlice';
import { Truck, Lock, Mail, User, Phone, Award, UserPlus, AlertCircle } from 'lucide-react';

/* ─── Design tokens (inline — no Tailwind dependency) ────────────────────── */
const BG    = '#0E0E0E';
const CARD  = '#161616';
const BORD  = '#2A2A2A';
const DIM   = '#9AA3A8';
const BLUE  = '#448AFF';

const AuthInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && <Icon size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: DIM, pointerEvents: 'none' }} />}
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box', height: '40px',
        paddingLeft: Icon ? '36px' : '12px', paddingRight: '12px',
        background: '#1A1A1A', border: `1px solid ${BORD}`,
        borderRadius: '8px', color: '#E0E0E0', fontSize: '13px',
        fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', transition: 'border-color 0.15s',
      }}
      onFocus={(e) => { e.target.style.borderColor = BLUE + '88'; }}
      onBlur={(e)  => { e.target.style.borderColor = BORD; }}
    />
  </div>
);

const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: DIM, marginBottom: '6px', fontFamily: 'monospace' }}>
    {children}
  </label>
);

export const RegisterPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', licenseNumber: '', currentCity: '', currentProvince: '',
  });

  // Drivers always land on /driver/terminal after register
  useEffect(() => {
    if (isAuthenticated) navigate('/driver/terminal', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = useCallback((e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    await dispatch(registerDriver(form));
  }, [dispatch, form]);

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '14px', background: BLUE + '18', border: `1px solid ${BLUE}30`, marginBottom: '14px' }}>
            <Truck size={28} style={{ color: BLUE }} />
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#E0E0E0' }}>Driver Sign-Up</h1>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: DIM, fontFamily: 'monospace' }}>
            Register as a Rider to receive delivery trips
          </p>
        </div>

        {/* Form */}
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: '10px', padding: '22px' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', marginBottom: '14px', background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.25)', borderRadius: '7px' }}>
                <AlertCircle size={13} style={{ color: '#FF5252' }} />
                <span style={{ fontSize: '12px', color: '#FF5252', fontFamily: 'monospace' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <FieldLabel>Full Name *</FieldLabel>
                <AuthInput icon={User} name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <FieldLabel>Mobile Number</FieldLabel>
                <AuthInput icon={Phone} name="phone" type="tel" placeholder="03XX-XXXXXXX" value={form.phone} onChange={handleChange} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldLabel>Email Address *</FieldLabel>
                <AuthInput icon={Mail} name="email" type="email" placeholder="driver@email.com" value={form.email} onChange={handleChange} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldLabel>Password *</FieldLabel>
                <AuthInput icon={Lock} name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              <div>
                <FieldLabel>License Number</FieldLabel>
                <AuthInput icon={Award} name="licenseNumber" placeholder="e.g. PB-123456" value={form.licenseNumber} onChange={handleChange} />
              </div>
              <div>
                <FieldLabel>Current City</FieldLabel>
                <AuthInput name="currentCity" placeholder="e.g. Lahore" value={form.currentCity} onChange={handleChange} />
              </div>
              <div>
                <FieldLabel>Province</FieldLabel>
                <AuthInput name="currentProvince" placeholder="e.g. Punjab" value={form.currentProvince} onChange={handleChange} />
              </div>
            </div>

            <button
              type="submit"
              id="driver-register-btn"
              disabled={loading}
              style={{
                width: '100%', height: '42px', borderRadius: '8px', border: 'none',
                background: loading ? '#1A1A1A' : `linear-gradient(135deg, ${BLUE}, #1565C0)`,
                color: loading ? DIM : '#fff', fontWeight: 800, fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⚙</span> Creating account…</>
              ) : (
                <><UserPlus size={15} /> Create Driver Account</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: DIM }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: BLUE, fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            {' '}·{' '}
            <Link to="/client/register" style={{ color: '#00E676', fontWeight: 700, textDecoration: 'none' }}>Register as Client</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
