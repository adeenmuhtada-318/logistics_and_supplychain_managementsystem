import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Package,
  Ruler,
  Banknote,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  Navigation,
  Star,
  Phone,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

/* ─── Simulated Dispatch Request Pool ───────────────────────────────────── */
const DISPATCH_POOL = [
  {
    id: 'DSP-2026-0847',
    origin: 'Lahore',
    originDetail: 'Quaid-e-Azam Industrial Estate, Kot Lakhpat',
    destination: 'Karachi',
    destinationDetail: 'Korangi Industrial Area, Sector 15',
    cargo: 'Textile Bales',
    cargoWeight: '22 MT',
    cargoType: 'Non-Hazardous',
    distanceKm: 1210,
    transitHours: '20h 10m',
    payout: '₨ 38,500',
    payoutBreakdown: { base: '₨ 32,000', fuel: '₨ 4,500', toll: '₨ 2,000' },
    priority: 'Express',
    client: 'Pak Textile Mills Ltd.',
    vehicleRequired: '20-Ton Flatbed Trailer',
    countdown: 30,
  },
  {
    id: 'DSP-2026-0891',
    origin: 'Faisalabad',
    originDetail: 'M-3 Industrial City, Main Gate',
    destination: 'Islamabad',
    destinationDetail: 'I-9 Industrial Area, Sector 3',
    cargo: 'Machinery Parts',
    cargoWeight: '6 MT',
    cargoType: 'Fragile / Handle with Care',
    distanceKm: 290,
    transitHours: '4h 50m',
    payout: '₨ 14,200',
    payoutBreakdown: { base: '₨ 11,000', fuel: '₨ 2,200', toll: '₨ 1,000' },
    priority: 'Standard',
    client: 'Atlas Engineering Co.',
    vehicleRequired: 'Medium Duty Flatbed (7T)',
    countdown: 30,
  },
  {
    id: 'DSP-2026-0903',
    origin: 'Karachi',
    originDetail: 'KITE City, Bin Qasim Industrial Zone',
    destination: 'Multan',
    destinationDetail: 'Multan Industrial Estate, Plot 44',
    cargo: 'Consumer Electronics',
    cargoWeight: '3.5 MT',
    cargoType: 'High-Value Cargo',
    distanceKm: 900,
    transitHours: '15h 00m',
    payout: '₨ 28,000',
    payoutBreakdown: { base: '₨ 22,000', fuel: '₨ 4,000', toll: '₨ 2,000' },
    priority: 'Urgent',
    client: 'MegaMart Distributors',
    vehicleRequired: 'Enclosed Cargo Van (5T)',
    countdown: 30,
  },
];

const RANDOM_REQUEST = () => DISPATCH_POOL[Math.floor(Math.random() * DISPATCH_POOL.length)];

/* ─── Priority badge config ─────────────────────────────────────────────── */
const PRIORITY_STYLE = {
  Express:  { bg: 'rgba(68,138,255,0.12)', border: 'rgba(68,138,255,0.3)',  color: '#448AFF' },
  Standard: { bg: 'rgba(0,230,118,0.10)', border: 'rgba(0,230,118,0.28)',  color: '#00E676' },
  Urgent:   { bg: 'rgba(255,82,82,0.12)', border: 'rgba(255,82,82,0.32)',  color: '#FF5252' },
};

/* ─── Reusable detail row ───────────────────────────────────────────────── */
const DetailRow = ({ icon: Icon, label, value, valueColor = '#E0E0E0', accent = '#9AA3A8' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '11px 0',
      borderBottom: '1px solid #222',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: accent + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={13} style={{ color: accent }} />
      </div>
      <span style={{ fontSize: '11px', color: '#9AA3A8', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
    <span
      style={{
        fontSize: '12px',
        fontWeight: 700,
        color: valueColor,
        fontFamily: 'monospace',
        textAlign: 'right',
        maxWidth: '55%',
      }}
    >
      {value}
    </span>
  </div>
);

/* ─── Countdown ring SVG ────────────────────────────────────────────────── */
const CountdownRing = ({ remaining, total }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const progress = remaining / total;
  const dashOffset = circ * (1 - progress);
  const color = remaining > 10 ? '#00E676' : remaining > 5 ? '#FFB300' : '#FF5252';

  return (
    <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="#2A2A2A" strokeWidth="5" />
      <circle
        cx="46"
        cy="46"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
      />
      <text
        x="46"
        y="46"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: '46px 46px',
          fill: color,
          fontSize: '18px',
          fontWeight: 800,
          fontFamily: 'monospace',
        }}
      >
        {remaining}
      </text>
    </svg>
  );
};

/* ─── Confirmation Screen ────────────────────────────────────────────────── */
const TripConfirmed = ({ request, onNewRequest }) => (
  <div
    style={{
      minHeight: '100vh',
      background: '#0D0D0D',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}
  >
    {/* Animated success pulse */}
    <div style={{ position: 'relative', marginBottom: '28px' }}>
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'rgba(0,230,118,0.12)',
          border: '2px solid rgba(0,230,118,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'successPulse 2s ease-in-out infinite',
        }}
      >
        <CheckCircle2 size={40} style={{ color: '#00E676' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: '50%',
          border: '1px solid rgba(0,230,118,0.15)',
          animation: 'ringExpand 2s ease-out infinite',
        }}
      />
    </div>

    <p
      style={{
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#00E676',
        fontFamily: 'monospace',
        marginBottom: '8px',
      }}
    >
      Trip Assigned Successfully
    </p>
    <h1
      style={{
        fontSize: '22px',
        fontWeight: 800,
        color: '#E0E0E0',
        textAlign: 'center',
        marginBottom: '6px',
        lineHeight: 1.2,
      }}
    >
      You&rsquo;re Heading to<br />
      <span style={{ color: '#00E676' }}>{request.destination}</span>
    </h1>
    <p style={{ fontSize: '12px', color: '#9AA3A8', marginBottom: '28px', textAlign: 'center' }}>
      {request.destinationDetail}
    </p>

    {/* Trip summary card */}
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        background: '#161616',
        border: '1px solid #2A2A2A',
        borderRadius: '14px',
        padding: '20px 22px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#555', letterSpacing: '0.1em' }}>
          {request.id}
        </span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 8px',
            background: 'rgba(0,230,118,0.1)',
            border: '1px solid rgba(0,230,118,0.25)',
            borderRadius: '999px',
            color: '#00E676',
            fontFamily: 'monospace',
          }}
        >
          CONFIRMED
        </span>
      </div>

      {/* Route visual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0,230,118,0.1)',
              border: '1px solid rgba(0,230,118,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
            }}
          >
            <MapPin size={16} style={{ color: '#00E676' }} />
          </div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#E0E0E0', fontFamily: 'monospace' }}>
            {request.origin}
          </p>
        </div>
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #00E676, #448AFF)', borderRadius: '1px' }} />
        <Truck size={18} style={{ color: '#448AFF', flexShrink: 0 }} />
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #448AFF, #9AA3A8)', borderRadius: '1px' }} />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(68,138,255,0.1)',
              border: '1px solid rgba(68,138,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
            }}
          >
            <MapPin size={16} style={{ color: '#448AFF' }} />
          </div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#E0E0E0', fontFamily: 'monospace' }}>
            {request.destination}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {[
          { label: 'Distance', value: `${request.distanceKm} km` },
          { label: 'Transit', value: request.transitHours },
          { label: 'Payout', value: request.payout, color: '#00E676' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '8px', color: '#9AA3A8', fontFamily: 'monospace', marginBottom: '4px', letterSpacing: '0.08em' }}>
              {s.label}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: s.color || '#E0E0E0', fontFamily: 'monospace' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Action buttons */}
    <div style={{ width: '100%', maxWidth: '400px', display: 'flex', gap: '12px' }}>
      <button
        style={{
          flex: 1,
          height: '46px',
          background: 'rgba(0,230,118,0.1)',
          border: '1px solid rgba(0,230,118,0.3)',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#00E676',
          cursor: 'pointer',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          letterSpacing: '0.05em',
        }}
      >
        <Phone size={13} /> Contact Dispatcher
      </button>
      <button
        onClick={onNewRequest}
        style={{
          flex: 1,
          height: '46px',
          background: 'linear-gradient(135deg, #00E676, #00BFA5)',
          border: 'none',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#0D1F1A',
          cursor: 'pointer',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          letterSpacing: '0.05em',
        }}
      >
        <Navigation size={13} /> Start Navigation
      </button>
    </div>

    <style>{`
      @keyframes successPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0,230,118,0.25); }
        50%       { box-shadow: 0 0 0 16px rgba(0,230,118,0); }
      }
      @keyframes ringExpand {
        0%   { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.4); opacity: 0; }
      }
    `}</style>
  </div>
);

/* ─── Declined / Expired Screen ─────────────────────────────────────────── */
const TripDeclined = ({ expired, onNewRequest }) => (
  <div
    style={{
      minHeight: '100vh',
      background: '#0D0D0D',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}
  >
    <div
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(255,82,82,0.1)',
        border: '2px solid rgba(255,82,82,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}
    >
      {expired ? (
        <Clock size={36} style={{ color: '#FF5252' }} />
      ) : (
        <XCircle size={36} style={{ color: '#FF5252' }} />
      )}
    </div>
    <p
      style={{
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#FF5252',
        fontFamily: 'monospace',
        marginBottom: '8px',
      }}
    >
      {expired ? 'Request Expired' : 'Trip Declined'}
    </p>
    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#E0E0E0', marginBottom: '8px', textAlign: 'center' }}>
      {expired ? 'Time ran out' : 'No problem'}
    </h2>
    <p style={{ fontSize: '12px', color: '#9AA3A8', marginBottom: '32px', textAlign: 'center', maxWidth: '300px' }}>
      {expired
        ? 'The dispatch was automatically re-assigned. Looking for your next available trip.'
        : 'This trip has been passed to the next available driver. We\'ll find you another one shortly.'}
    </p>
    <button
      onClick={onNewRequest}
      style={{
        width: '100%',
        maxWidth: '340px',
        height: '46px',
        background: '#1E1E1E',
        border: '1px solid #2A2A2A',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#E0E0E0',
        cursor: 'pointer',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '0.06em',
      }}
    >
      <Zap size={14} style={{ color: '#00E676' }} /> Find Next Trip
    </button>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const DriverConsent = () => {
  const navigate = useNavigate();
  const [request, setRequest] = useState(() => RANDOM_REQUEST());
  const [remaining, setRemaining] = useState(request.countdown);
  const [state, setState] = useState('pending'); // pending | accepted | declined | expired
  const [accepting, setAccepting] = useState(false);
  const timerRef = useRef(null);

  /* ── Countdown tick ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (state !== 'pending') return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          setState('expired');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state, request]);

  /* ── Accept handler ──────────────────────────────────────────────────── */
  const handleAccept = useCallback(async () => {
    clearInterval(timerRef.current);
    setAccepting(true);
    await new Promise((r) => setTimeout(r, 800)); // tactile delay
    setState('accepted');
  }, []);

  /* ── Decline handler ─────────────────────────────────────────────────── */
  const handleDecline = useCallback(() => {
    clearInterval(timerRef.current);
    setState('declined');
  }, []);

  /* ── New request handler ─────────────────────────────────────────────── */
  const handleNewRequest = useCallback(() => {
    const next = RANDOM_REQUEST();
    setRequest(next);
    setRemaining(next.countdown);
    setAccepting(false);
    setState('pending');
  }, []);

  /* ── Derived values ──────────────────────────────────────────────────── */
  const timeColor = remaining > 10 ? '#00E676' : remaining > 5 ? '#FFB300' : '#FF5252';
  const pStyle = PRIORITY_STYLE[request.priority] || PRIORITY_STYLE.Standard;
  const barPct = (remaining / request.countdown) * 100;
  const barColor = remaining > 10 ? '#00E676' : remaining > 5 ? '#FFB300' : '#FF5252';

  /* ── Branching screens ───────────────────────────────────────────────── */
  if (state === 'accepted') return <TripConfirmed request={request} onNewRequest={handleNewRequest} />;
  if (state === 'declined') return <TripDeclined expired={false} onNewRequest={handleNewRequest} />;
  if (state === 'expired') return <TripDeclined expired={true} onNewRequest={handleNewRequest} />;

  /* ── Pending / incoming request screen ──────────────────────────────── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 32px',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '240px',
          background: 'radial-gradient(ellipse, rgba(0,230,118,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00E676',
              animation: 'livePulse 1.4s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#00E676',
              fontFamily: 'monospace',
            }}
          >
            Incoming Dispatch
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '10px',
            color: '#555',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Go Offline
        </button>
      </div>

      {/* ── Countdown ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
          position: 'relative',
        }}
      >
        <CountdownRing remaining={remaining} total={request.countdown} />
        <p
          style={{
            fontSize: '9px',
            color: '#9AA3A8',
            fontFamily: 'monospace',
            marginTop: '6px',
            letterSpacing: '0.08em',
          }}
        >
          seconds to accept
        </p>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '0 20px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            height: '4px',
            background: '#1E1E1E',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${barPct}%`,
              background: `linear-gradient(90deg, ${barColor}CC, ${barColor})`,
              borderRadius: '2px',
              transition: 'width 1s linear, background 0.3s',
              boxShadow: `0 0 8px ${barColor}55`,
            }}
          />
        </div>
      </div>

      {/* ── Main card ────────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Request header */}
        <div
          style={{
            background: '#1E1E1E',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent strip */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00E676, #00BFA5, transparent)',
            }}
          />

          {/* ID + Priority */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#555',
                letterSpacing: '0.08em',
              }}
            >
              {request.id}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '3px 10px',
                background: pStyle.bg,
                border: `1px solid ${pStyle.border}`,
                borderRadius: '999px',
                color: pStyle.color,
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
              }}
            >
              {request.priority.toUpperCase()}
            </span>
          </div>

          {/* Route visual */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {/* Origin */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                <div
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#00E676', boxShadow: '0 0 6px #00E676AA',
                  }}
                />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#E0E0E0' }}>
                  {request.origin}
                </span>
              </div>
              <p style={{ fontSize: '10px', color: '#9AA3A8', lineHeight: 1.4, paddingLeft: '13px' }}>
                {request.originDetail}
              </p>
            </div>

            {/* Arrow */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
              }}
            >
              <ArrowRight size={18} style={{ color: '#00E676' }} />
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: '#555',
                  whiteSpace: 'nowrap',
                }}
              >
                {request.distanceKm} km
              </span>
            </div>

            {/* Destination */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '5px',
                  marginBottom: '3px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#E0E0E0' }}>
                  {request.destination}
                </span>
                <div
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#448AFF', boxShadow: '0 0 6px #448AFFAA',
                  }}
                />
              </div>
              <p style={{ fontSize: '10px', color: '#9AA3A8', lineHeight: 1.4, paddingRight: '13px' }}>
                {request.destinationDetail}
              </p>
            </div>
          </div>

          {/* Payout highlight */}
          <div
            style={{
              background: 'rgba(0,230,118,0.06)',
              border: '1px solid rgba(0,230,118,0.2)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '9px', color: '#9AA3A8', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '2px' }}>
                YOUR PAYOUT
              </p>
              <p style={{ fontSize: '26px', fontWeight: 900, color: '#00E676', fontFamily: 'monospace', lineHeight: 1 }}>
                {request.payout}
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', color: '#555', fontFamily: 'monospace', lineHeight: 1.8 }}>
              <p>Base &nbsp;&nbsp;&nbsp;{request.payoutBreakdown.base}</p>
              <p>Fuel &nbsp;&nbsp;&nbsp;{request.payoutBreakdown.fuel}</p>
              <p>Toll &nbsp;&nbsp;&nbsp;{request.payoutBreakdown.toll}</p>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div
          style={{
            background: '#1E1E1E',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            padding: '6px 20px 4px',
          }}
        >
          <DetailRow icon={Package} label="Cargo Type" value={request.cargo} accent="#FFB300" />
          <DetailRow icon={AlertTriangle} label="Cargo Classification" value={request.cargoType}
            valueColor={request.cargoType.includes('Hazardous') || request.cargoType.includes('High-Value') ? '#FF5252' : '#9AA3A8'}
            accent="#FF5252" />
          <DetailRow icon={Ruler} label="Weight" value={request.cargoWeight} accent="#448AFF" />
          <DetailRow icon={Clock} label="Est. Transit Time" value={request.transitHours} accent="#9AA3A8" />
          <DetailRow icon={Truck} label="Required Vehicle" value={request.vehicleRequired} accent="#00E676" />
          <DetailRow icon={Shield} label="Client" value={request.client} accent="#448AFF"
            valueColor="#448AFF" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 0' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={12} style={{ color: s <= 4 ? '#FFB300' : '#2A2A2A', fill: s <= 4 ? '#FFB300' : 'none' }} />
            ))}
            <span style={{ fontSize: '10px', color: '#9AA3A8', fontFamily: 'monospace', marginLeft: '4px' }}>
              4.0 &mdash; Verified Client
            </span>
          </div>
        </div>

        {/* ── CTA Buttons ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          {/* Decline */}
          <button
            onClick={handleDecline}
            style={{
              flex: 1,
              height: '56px',
              background: 'transparent',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#9AA3A8',
              cursor: 'pointer',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF5252';
              e.currentTarget.style.color = '#FF5252';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
              e.currentTarget.style.color = '#9AA3A8';
            }}
          >
            <XCircle size={16} /> Decline
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              flex: 2,
              height: '56px',
              background: accepting
                ? 'rgba(0,230,118,0.15)'
                : 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
              border: accepting ? '1px solid rgba(0,230,118,0.3)' : 'none',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 800,
              color: accepting ? '#00E676' : '#071A10',
              cursor: accepting ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: accepting ? 'none' : '0 4px 24px rgba(0,230,118,0.3)',
              transition: 'all 0.2s',
              animation: !accepting ? 'acceptGlow 2.5s ease-in-out infinite' : 'none',
            }}
          >
            {accepting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Assigning&hellip;
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Accept Trip
              </>
            )}
          </button>
        </div>

        {/* Safety note */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#444',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}
        >
          ⚡ Auto-declines in {remaining}s &mdash; No penalty for decline
        </p>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes acceptGlow {
          0%, 100% { box-shadow: 0 4px 24px rgba(0,230,118,0.30); }
          50%       { box-shadow: 0 4px 36px rgba(0,230,118,0.55); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
