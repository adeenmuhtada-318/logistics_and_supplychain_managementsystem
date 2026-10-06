import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package, TrendingUp, Clock, CheckCircle2, Truck, MapPin,
  Calendar, ArrowUpRight, RefreshCw, Building2, FileText,
  PlusCircle, LogOut, AlertCircle, XCircle,
  ArrowLeft,
} from 'lucide-react';
import { fetchOrders } from '../../features/orders/orderSlice';
import { logout } from '../../features/auth/authSlice';

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const BG_MAIN = '#0E0E0E';
const BG_CARD = '#161616';
const BORDER  = '#2A2A2A';
const DIM     = '#9AA3A8';
const ACCENT  = '#00E676';

/* ─── Status mapping (backend enum → display label + colour) ─────────────── */
const STATUS_MAP = {
  'Pending-Fare-Estimate':  { label: 'Calculating',  color: '#9AA3A8', pulse: false },
  'Pending-Payment':        { label: 'Awaiting Payment', color: '#FF9800', pulse: true  },
  'Pending-Driver-Consent': { label: 'Finding Rider', color: '#448AFF', pulse: true  },
  'Driver-Accepted':        { label: 'Rider Assigned', color: '#00E676', pulse: false },
  'Picked-Up':              { label: 'Picked Up',    color: '#00E676', pulse: false },
  'In-Transit':             { label: 'En Route',     color: '#448AFF', pulse: true  },
  'At-Stop':                { label: 'At Stop',      color: '#FFB300', pulse: false },
  'Delivered':              { label: 'Delivered',    color: '#00E676', pulse: false },
  'Cancelled':              { label: 'Cancelled',    color: '#FF5252', pulse: false },
  'Expired':                { label: 'Expired',      color: '#FF5252', pulse: false },
  'Incident':               { label: 'Incident',     color: '#FF5252', pulse: false },
};

/* ─── Status Badge ───────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, color: DIM, pulse: false };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 9px',
      background: s.color + '15', border: `1px solid ${s.color}30`,
      borderRadius: '999px', fontSize: '10px', fontWeight: 700,
      color: s.color, fontFamily: 'monospace', letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
    }}>
      {s.pulse && (
        <span style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: s.color, animation: 'pulse 1.4s ease-in-out infinite',
        }} />
      )}
      {s.label}
    </span>
  );
};

/* ─── KPI Bento Card ─────────────────────────────────────────────────────── */
const BentoCard = ({ label, value, sub, accent, icon: Icon, trend }) => (
  <div
    style={{
      background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '10px',
      padding: '20px', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.15s', cursor: 'default',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent + '55'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(20px)', pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: accent + '18', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      {trend === 'up' && <ArrowUpRight size={14} style={{ color: ACCENT, marginTop: '2px' }} />}
    </div>
    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, marginBottom: '6px', fontFamily: 'monospace' }}>{label}</p>
    <p style={{ fontSize: '22px', fontWeight: 800, color: '#E0E0E0', fontFamily: 'monospace', lineHeight: 1, marginBottom: '6px' }}>{value}</p>
    <p style={{ fontSize: '10px', color: DIM, fontFamily: 'monospace' }}>{sub}</p>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const ClientDashboard = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { orders: rawOrders, loading, error } = useSelector((s) => s.orders) || {};
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const { user }  = useSelector((s) => s.auth);

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleRefresh = () => dispatch(fetchOrders());
  const handleLogout  = () => { dispatch(logout()); navigate('/login'); };

  const FILTERS = ['All', 'Pending-Payment', 'Pending-Driver-Consent', 'In-Transit', 'Delivered', 'Cancelled'];

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  // Derive KPIs from real data
  const activeCount    = orders.filter((o) => ['Pending-Driver-Consent', 'Driver-Accepted', 'Picked-Up', 'In-Transit', 'At-Stop'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const pendingPayment = orders.filter((o) => o.status === 'Pending-Payment').length;
  const totalSpent     = orders.filter((o) => o.status === 'Delivered').reduce((acc, o) => acc + (o.estimatedFarePKR || 0), 0);

  const KPI = [
    { label: 'Total Spent (PKR)', value: `₨ ${totalSpent.toLocaleString('en-PK')}`, sub: 'Confirmed deliveries only', accent: ACCENT, icon: TrendingUp, trend: 'up' },
    { label: 'Active Orders',     value: String(activeCount),  sub: 'En route + searching rider', accent: '#448AFF', icon: Truck, trend: 'neutral' },
    { label: 'Delivered',         value: String(deliveredCount), sub: 'Completed shipments', accent: '#FFB300', icon: CheckCircle2, trend: 'up' },
    { label: 'Pending Payment',   value: String(pendingPayment), sub: 'Awaiting payment confirm', accent: '#FF9800', icon: Clock, trend: 'neutral' },
  ];

  const activeOrders = orders.filter((o) =>
    ['Pending-Driver-Consent', 'Driver-Accepted', 'In-Transit'].includes(o.status)
  );

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, padding: '28px 24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} aria-label="Go back" style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '7px', color: DIM, cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={14} />
            </button>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ACCENT + '18', border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} style={{ color: ACCENT }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#E0E0E0', margin: 0 }}>
                  {user?.corporateProfile?.companyName || user?.name || 'Client Portal'}
                </h1>
                <span style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#FFB300',
                  fontFamily: 'monospace', background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.25)',
                  borderRadius: '4px', padding: '2px 7px',
                }}>B2B CLIENT</span>
              </div>
              <p style={{ fontSize: '11px', color: DIM, fontFamily: 'monospace', marginTop: '2px' }}>
                {user?.corporateProfile?.ntn ? `NTN: ${user.corporateProfile.ntn}` : user?.email || ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              id="place-order-btn"
              onClick={() => navigate('/client/place-order')}
              style={{
                height: '36px', padding: '0 16px',
                background: `linear-gradient(135deg, ${ACCENT}, #00C853)`,
                border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700,
                color: '#0A0A0A', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <PlusCircle size={13} /> Place New Order
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                height: '34px', padding: '0 14px', background: 'transparent',
                border: `1px solid ${BORDER}`, borderRadius: '6px', fontSize: '11px',
                fontWeight: 600, color: loading ? '#555' : DIM, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace',
              }}
            >
              <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                height: '34px', padding: '0 12px', background: 'transparent',
                border: `1px solid ${BORDER}`, borderRadius: '6px', fontSize: '11px',
                color: '#FF5252', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'monospace',
              }}
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────── */}
        {error && (
          <div style={{
            background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.2)',
            borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertCircle size={14} style={{ color: '#FF5252' }} />
            <span style={{ fontSize: '12px', color: '#FF5252', fontFamily: 'monospace' }}>{error}</span>
          </div>
        )}

        {/* ── KPI Grid ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {KPI.map((kpi, i) => <BentoCard key={i} {...kpi} />)}
        </div>

        {/* ── Active Shipments Strip ───────────────────────────────────── */}
        {activeOrders.length > 0 && (
          <div style={{
            background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '10px',
            padding: '18px 22px', marginBottom: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(180deg, #448AFF, #2979FF)', borderRadius: '10px 0 0 10px' }} />
            <div style={{ paddingLeft: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Truck size={13} style={{ color: '#448AFF' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#448AFF', fontFamily: 'monospace' }}>
                  Active Shipments
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {activeOrders.map((o) => (
                  <div key={o._id} style={{ background: '#1A1A1A', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '12px 16px', minWidth: '220px', flex: '1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: DIM }}>{o.orderNumber}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <MapPin size={10} style={{ color: '#448AFF' }} />
                      <span style={{ fontSize: '12px', color: '#E0E0E0', fontWeight: 600 }}>
                        {o.pickup?.city} → {o.dropoff?.city}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Package size={10} style={{ color: DIM }} />
                      <span style={{ fontSize: '11px', color: DIM }}>{o.cargoDescription} ({o.cargoWeightKg} kg)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Order History Table ──────────────────────────────────────── */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap', gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={13} style={{ color: DIM }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM, fontFamily: 'monospace' }}>Order History</span>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#555', background: '#1A1A1A', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '1px 6px' }}>
                {filtered.length} records
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    height: '28px', padding: '0 12px',
                    background: filter === f ? ACCENT + '18' : 'transparent',
                    border: `1px solid ${filter === f ? ACCENT + '50' : BORDER}`,
                    borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                    color: filter === f ? ACCENT : DIM,
                    cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s',
                  }}
                >
                  {f === 'All' ? 'All' : (STATUS_MAP[f]?.label || f)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: DIM, fontFamily: 'monospace', fontSize: '12px' }}>
                <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '8px' }} />
                <br />Loading orders…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Package size={32} style={{ color: '#333', marginBottom: '10px' }} />
                <p style={{ color: DIM, fontFamily: 'monospace', fontSize: '12px', margin: 0 }}>
                  {orders.length === 0 ? 'No orders yet.' : 'No orders match this filter.'}
                </p>
                {orders.length === 0 && (
                  <button
                    onClick={() => navigate('/client/place-order')}
                    style={{
                      marginTop: '14px', padding: '8px 18px',
                      background: ACCENT + '18', border: `1px solid ${ACCENT}40`,
                      borderRadius: '6px', color: ACCENT, fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'monospace',
                    }}
                  >
                    + Place your first order
                  </button>
                )}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: '#1A1A1A' }}>
                    {['Order ID', 'Route', 'Cargo', 'Weight', 'Priority', 'Status', 'Est. Fare (PKR)'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left', fontSize: '9px',
                        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: '#555', fontFamily: 'monospace', borderBottom: `1px solid ${BORDER}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, idx) => (
                    <tr
                      key={o._id}
                      style={{ background: idx % 2 === 0 ? 'transparent' : '#1A1A1A18', borderBottom: `1px solid #1E1E1E`, transition: 'background 0.12s', cursor: 'default' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1F1F1F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#1A1A1A18'; }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: ACCENT, fontSize: '11px' }}>{o.orderNumber}</td>
                      <td style={{ padding: '12px 16px', color: '#E0E0E0', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={10} style={{ color: DIM, flexShrink: 0 }} />
                          {o.pickup?.city} → {o.dropoff?.city}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: DIM }}>{o.cargoDescription}</td>
                      <td style={{ padding: '12px 16px', color: DIM, fontFamily: 'monospace' }}>{o.cargoWeightKg} kg</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
                          color: o.priority === 'Express' ? '#448AFF' : ACCENT,
                        }}>{o.priority}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#E0E0E0' }}>
                        ₨ {(o.estimatedFarePKR || 0).toLocaleString('en-PK')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ padding: '12px 22px', borderTop: `1px solid #1E1E1E`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
              Read-only client view — internal logistics costs not disclosed
            </span>
            <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
              Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};
