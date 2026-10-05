import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, Package, Ruler, Banknote, CheckCircle2, XCircle,
  Truck, Clock, Navigation, Star, AlertTriangle, ArrowRight,
  Shield, Zap, RefreshCw, LogOut, Wifi, WifiOff,
} from 'lucide-react';
import { fetchOrders, respondToOffer } from '../../features/orders/orderSlice';
import { logout } from '../../features/auth/authSlice';

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const BG_MAIN = '#0D0D0D';
const BG_CARD = '#141414';
const BORDER  = '#222';
const DIM     = '#9AA3A8';
const ACCENT  = '#00E676';

/* ─── Priority badge config ─────────────────────────────────────────────── */
const PRIORITY_STYLE = {
  Express:  { bg: 'rgba(68,138,255,0.12)', border: 'rgba(68,138,255,0.3)',  color: '#448AFF' },
  Standard: { bg: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.28)',  color: '#00E676' },
  Urgent:   { bg: 'rgba(255,82,82,0.12)', border: 'rgba(255,82,82,0.32)',  color: '#FF5252' },
};

/* ─── Reusable detail row ────────────────────────────────────────────────── */
const DetailRow = ({ icon: Icon, label, value, valueColor = '#E0E0E0', accent = DIM }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${BORDER}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} style={{ color: accent }} />
      </div>
      <span style={{ fontSize: '11px', color: DIM, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{label}</span>
    </div>
    <span style={{ fontSize: '12px', fontWeight: 700, color: valueColor, fontFamily: 'monospace', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
  </div>
);

/* ─── Trip Card ──────────────────────────────────────────────────────────── */
const TripCard = ({ order, onAccept, onDecline, submitting }) => {
  const priority     = order.priority || 'Standard';
  const ps           = PRIORITY_STYLE[priority] || PRIORITY_STYLE.Standard;
  const distKm       = order.calculatedDistanceKm?.toFixed(1) || '—';
  const durMins      = order.calculatedDurationHours ? Math.round(order.calculatedDurationHours * 60) : '—';
  const payout       = order.estimatedFarePKR ? `₨ ${Number(order.estimatedFarePKR).toLocaleString('en-PK')}` : '—';

  return (
    <div style={{
      width: '100%', maxWidth: '440px', margin: '0 auto',
      background: BG_CARD, border: `1px solid ${BORDER}`,
      borderRadius: '18px', overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
    }}>
      {/* Card Header */}
      <div style={{
        padding: '18px 22px 14px',
        background: 'linear-gradient(135deg, #1A1A1A, #141414)',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#555', letterSpacing: '0.1em' }}>
            {order.orderNumber}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 9px', background: ps.bg, border: `1px solid ${ps.border}`, borderRadius: '999px', color: ps.color, fontFamily: 'monospace' }}>
            {priority}
          </span>
        </div>

        {/* Route visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
              <Navigation size={16} style={{ color: ACCENT }} />
            </div>
            <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace' }}>PICK</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
              <div style={{ height: '1px', flex: 1, background: `linear-gradient(90deg, ${ACCENT}40, transparent)` }} />
              <Truck size={14} style={{ color: ACCENT, opacity: 0.7 }} />
              <div style={{ height: '1px', flex: 1, background: `linear-gradient(90deg, transparent, #448AFF40)` }} />
            </div>
            <div style={{ marginTop: '4px', fontSize: '9px', color: DIM, fontFamily: 'monospace' }}>
              {distKm} km · {durMins} min
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(68,138,255,0.1)', border: '1px solid rgba(68,138,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
              <MapPin size={16} style={{ color: '#448AFF' }} />
            </div>
            <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace' }}>DROP</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#E0E0E0' }}>{order.pickup?.city}</div>
            <div style={{ fontSize: '10px', color: DIM }}>{order.pickup?.streetAddress?.slice(0, 30)}…</div>
          </div>
          <ArrowRight size={16} style={{ color: DIM, marginTop: '6px' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#E0E0E0' }}>{order.dropoff?.city}</div>
            <div style={{ fontSize: '10px', color: DIM }}>{order.dropoff?.streetAddress?.slice(0, 30)}…</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '4px 22px 8px' }}>
        <DetailRow icon={Package}  label="Cargo"          value={order.cargoDescription}              accent={DIM} />
        <DetailRow icon={Zap}      label="Weight"         value={`${order.cargoWeightKg} kg`}         accent={DIM} />
        <DetailRow icon={Shield}   label="Cargo Type"     value={order.cargoType || 'General'}        accent={DIM} />
        <DetailRow icon={MapPin}   label="Contact"        value={order.contactPersonName || '—'}      accent={DIM} />
        <DetailRow icon={Banknote} label="Upfront Payout" value={payout} valueColor={ACCENT} accent={ACCENT} />
      </div>

      {/* Accept / Decline Buttons */}
      <div style={{ padding: '14px 22px 20px', display: 'flex', gap: '10px' }}>
        <button
          id={`decline-btn-${order._id}`}
          onClick={() => onDecline(order._id)}
          disabled={submitting}
          style={{
            flex: 1, padding: '13px', borderRadius: '10px',
            background: 'transparent', border: '1.5px solid rgba(255,82,82,0.35)',
            color: '#FF5252', fontWeight: 700, fontSize: '13px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'rgba(255,82,82,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <XCircle size={15} /> Decline
        </button>
        <button
          id={`accept-btn-${order._id}`}
          onClick={() => onAccept(order._id)}
          disabled={submitting}
          style={{
            flex: 2, padding: '13px', borderRadius: '10px',
            background: submitting ? '#1A1A1A' : `linear-gradient(135deg, ${ACCENT}, #00C853)`,
            border: 'none', color: submitting ? DIM : '#0A0A0A',
            fontWeight: 800, fontSize: '13px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          <CheckCircle2 size={15} /> Accept Trip
        </button>
      </div>
    </div>
  );
};

/* ─── Confirmed Screen ───────────────────────────────────────────────────── */
const TripConfirmed = ({ order, onViewNext }) => (
  <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div style={{ position: 'relative', marginBottom: '28px' }}>
      <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(0,230,118,0.12)', border: '2px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'successPulse 2s ease-in-out infinite' }}>
        <CheckCircle2 size={40} style={{ color: ACCENT }} />
      </div>
    </div>
    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, fontFamily: 'monospace', marginBottom: '8px' }}>Trip Assigned Successfully</p>
    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#E0E0E0', textAlign: 'center', marginBottom: '6px', lineHeight: 1.2 }}>
      You're heading to<br /><span style={{ color: ACCENT }}>{order?.dropoff?.city}</span>
    </h1>
    <p style={{ fontSize: '12px', color: DIM, marginBottom: '28px', textAlign: 'center' }}>
      Order #{order?.orderNumber} · {order?.cargoDescription}
    </p>
    <button
      onClick={onViewNext}
      style={{
        padding: '12px 28px', borderRadius: '10px',
        background: ACCENT + '18', border: `1px solid ${ACCENT}40`,
        color: ACCENT, fontWeight: 700, cursor: 'pointer', fontSize: '13px',
      }}
    >
      View My Assignments
    </button>
    <style>{`@keyframes successPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }`}</style>
  </div>
);

/* ─── Empty / Waiting Screen ────────────────────────────────────────────── */
const WaitingForTrips = ({ onRefresh, loading }) => (
  <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#1A1A1A', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
      <Truck size={30} style={{ color: '#333' }} />
    </div>
    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: DIM, fontFamily: 'monospace', marginBottom: '6px' }}>
      Waiting for Trips
    </p>
    <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px', textAlign: 'center', maxWidth: '280px' }}>
      No trips are currently available in your area. Pull to refresh or wait for new orders.
    </p>
    <button
      onClick={onRefresh}
      disabled={loading}
      style={{
        padding: '10px 22px', borderRadius: '8px', background: '#1A1A1A',
        border: `1px solid ${BORDER}`, color: DIM, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
      }}
    >
      <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
      Refresh Queue
    </button>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const DriverConsent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orders, loading, submitting } = useSelector((s) => s.orders);
  const { user }                        = useSelector((s) => s.auth);

  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [currentIdx,     setCurrentIdx]     = useState(0);
  const [online,         setOnline]         = useState(true);

  // Load broadcast queue orders
  useEffect(() => {
    dispatch(fetchOrders({ status: 'Pending-Driver-Consent' }));
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchOrders({ status: 'Pending-Driver-Consent' }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const broadcastOrders = orders.filter((o) => o.status === 'Pending-Driver-Consent');

  const handleAccept = useCallback(async (orderId) => {
    const result = await dispatch(respondToOffer({ orderId, response: 'Accepted' }));
    if (respondToOffer.fulfilled.match(result)) {
      const accepted = broadcastOrders.find((o) => o._id === orderId);
      setConfirmedOrder(accepted || result.payload?.data);
    }
  }, [dispatch, broadcastOrders]);

  const handleDecline = useCallback(async (orderId) => {
    await dispatch(respondToOffer({ orderId, response: 'Declined' }));
    // Move to next card
    setCurrentIdx((i) => Math.min(i + 1, broadcastOrders.length - 1));
    // Refresh queue
    setTimeout(() => dispatch(fetchOrders({ status: 'Pending-Driver-Consent' })), 500);
  }, [dispatch, broadcastOrders]);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  if (confirmedOrder) {
    return <TripConfirmed order={confirmedOrder} onViewNext={() => { setConfirmedOrder(null); setCurrentIdx(0); dispatch(fetchOrders({ status: 'Pending-Driver-Consent' })); }} />;
  }

  const currentOrder = broadcastOrders[currentIdx];

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top status bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#111', borderBottom: `1px solid ${BORDER}`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={16} style={{ color: ACCENT }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#E0E0E0' }}>
            FleetCore Terminal
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {online ? <Wifi size={13} style={{ color: ACCENT }} /> : <WifiOff size={13} style={{ color: '#FF5252' }} />}
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: online ? ACCENT : '#FF5252' }}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
          {user && (
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: DIM }}>
              {user.name}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: 'none', color: '#FF5252', cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={11} /> Logout
          </button>
        </div>
      </div>

      {/* Queue counter */}
      {!loading && broadcastOrders.length > 0 && (
        <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: DIM }}>
            Trip {currentIdx + 1} of {broadcastOrders.length} in queue
          </span>
          {broadcastOrders.length > 1 && currentIdx < broadcastOrders.length - 1 && (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              style={{ fontSize: '10px', color: '#448AFF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline' }}
            >
              Next →
            </button>
          )}
        </div>
      )}

      {/* Main content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 60px)' }}>
        {loading && !currentOrder ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <RefreshCw size={28} style={{ color: DIM, animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: DIM, fontFamily: 'monospace', fontSize: '12px' }}>Loading trip queue…</p>
          </div>
        ) : currentOrder ? (
          <TripCard
            key={currentOrder._id}
            order={currentOrder}
            onAccept={handleAccept}
            onDecline={handleDecline}
            submitting={submitting}
          />
        ) : (
          <WaitingForTrips
            onRefresh={() => dispatch(fetchOrders({ status: 'Pending-Driver-Consent' }))}
            loading={loading}
          />
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes successPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      `}</style>
    </div>
  );
};
