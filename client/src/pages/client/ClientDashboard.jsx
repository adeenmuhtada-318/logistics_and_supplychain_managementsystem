import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  Building2,
  FileText,
} from 'lucide-react';

/* ─── Static Demo Data (zero internal costs exposed) ────────────────────── */
const CLIENT_PROFILE = {
  company: 'Pak Freight Solutions (Pvt.) Ltd.',
  ntn: '1234567-0',
  since: 'March 2023',
  tier: 'Gold Partner',
};

const KPI = [
  {
    id: 'spent',
    label: 'Total Spent (PKR)',
    value: '₨ 14,82,500',
    sub: '+8.4% vs last quarter',
    trend: 'up',
    accent: '#00E676',
    icon: TrendingUp,
  },
  {
    id: 'active',
    label: 'Active Orders',
    value: '7',
    sub: '3 En Route · 4 Scheduled',
    trend: 'neutral',
    accent: '#448AFF',
    icon: Truck,
  },
  {
    id: 'delivered',
    label: 'Delivered (This Month)',
    value: '23',
    sub: '100% on-time rate',
    trend: 'up',
    accent: '#FFB300',
    icon: CheckCircle2,
  },
  {
    id: 'pending',
    label: 'Pending Confirmations',
    value: '2',
    sub: 'Awaiting dispatch slot',
    trend: 'neutral',
    accent: '#FF7043',
    icon: Clock,
  },
];

const ORDER_HISTORY = [
  {
    id: 'ORD-2024-0891',
    route: 'Lahore → Karachi',
    cargo: 'Textile Bales (18 MT)',
    date: '28 Sep 2026',
    eta: '30 Sep 2026',
    status: 'Delivered',
    amount: '₨ 128,000',
  },
  {
    id: 'ORD-2024-0876',
    route: 'Faisalabad → Islamabad',
    cargo: 'Machinery Parts (6 MT)',
    date: '25 Sep 2026',
    eta: '26 Sep 2026',
    status: 'Delivered',
    amount: '₨ 54,500',
  },
  {
    id: 'ORD-2024-0862',
    route: 'Karachi → Multan',
    cargo: 'Consumer Electronics (3 MT)',
    date: '22 Sep 2026',
    eta: '24 Sep 2026',
    status: 'Delivered',
    amount: '₨ 87,200',
  },
  {
    id: 'ORD-2024-0851',
    route: 'Lahore → Faisalabad',
    cargo: 'Raw Cotton (22 MT)',
    date: '18 Sep 2026',
    eta: '19 Sep 2026',
    status: 'Delivered',
    amount: '₨ 42,000',
  },
  {
    id: 'ORD-2024-0840',
    route: 'Islamabad → Peshawar',
    cargo: 'Pharmaceutical Goods (1.5 MT)',
    date: '15 Sep 2026',
    eta: '15 Sep 2026',
    status: 'Delivered',
    amount: '₨ 31,000',
  },
  {
    id: 'ORD-2024-0907',
    route: 'Lahore → Quetta',
    cargo: 'FMCG Goods (9 MT)',
    date: '30 Sep 2026',
    eta: '02 Oct 2026',
    status: 'En Route',
    amount: '₨ 96,000',
  },
  {
    id: 'ORD-2024-0912',
    route: 'Karachi → Islamabad',
    cargo: 'Steel Rods (30 MT)',
    date: '01 Oct 2026',
    eta: '03 Oct 2026',
    status: 'Scheduled',
    amount: '₨ 145,000',
  },
];

/* ─── Status badge helper ────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Delivered: { bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.25)', color: '#00E676' },
    'En Route': { bg: 'rgba(68,138,255,0.1)', border: 'rgba(68,138,255,0.25)', color: '#448AFF' },
    Scheduled: { bg: 'rgba(255,179,0,0.1)', border: 'rgba(255,179,0,0.25)', color: '#FFB300' },
    Cancelled: { bg: 'rgba(255,82,82,0.1)', border: 'rgba(255,82,82,0.25)', color: '#FF5252' },
  };
  const s = map[status] || map.Scheduled;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 9px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 700,
        color: s.color,
        fontFamily: 'monospace',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      {status === 'En Route' && (
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: s.color,
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      )}
      {status}
    </span>
  );
};

/* ─── KPI Bento Card ─────────────────────────────────────────────────────── */
const BentoCard = ({ kpi }) => {
  const Icon = kpi.icon;
  return (
    <div
      style={{
        background: '#161616',
        border: '1px solid #2A2A2A',
        borderRadius: '10px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = kpi.accent + '55';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2A2A2A';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Glow corner */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: kpi.accent,
          opacity: 0.06,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: kpi.accent + '18',
            border: `1px solid ${kpi.accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={15} style={{ color: kpi.accent }} />
        </div>
        {kpi.trend === 'up' && (
          <ArrowUpRight size={14} style={{ color: '#00E676', marginTop: '2px' }} />
        )}
      </div>
      <p
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#9AA3A8',
          marginBottom: '6px',
          fontFamily: 'monospace',
        }}
      >
        {kpi.label}
      </p>
      <p
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#E0E0E0',
          fontFamily: 'monospace',
          lineHeight: 1,
          marginBottom: '6px',
        }}
      >
        {kpi.value}
      </p>
      <p style={{ fontSize: '10px', color: '#9AA3A8', fontFamily: 'monospace' }}>
        {kpi.sub}
      </p>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const ClientDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const FILTERS = ['All', 'En Route', 'Scheduled', 'Delivered'];

  const filtered = filter === 'All'
    ? ORDER_HISTORY
    : ORDER_HISTORY.filter((o) => o.status === filter);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setRefreshing(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0E0E0E',
        padding: '28px 24px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(0,230,118,0.1)',
                border: '1px solid rgba(0,230,118,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} style={{ color: '#00E676' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#E0E0E0', margin: 0 }}>
                  {CLIENT_PROFILE.company}
                </h1>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#FFB300',
                    fontFamily: 'monospace',
                    background: 'rgba(255,179,0,0.1)',
                    border: '1px solid rgba(255,179,0,0.25)',
                    borderRadius: '4px',
                    padding: '2px 7px',
                  }}
                >
                  {CLIENT_PROFILE.tier}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#9AA3A8', fontFamily: 'monospace', marginTop: '2px' }}>
                NTN: {CLIENT_PROFILE.ntn} &nbsp;&bull;&nbsp; Client since {CLIENT_PROFILE.since}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/client/register')}
              style={{
                height: '34px',
                padding: '0 14px',
                background: 'transparent',
                border: '1px solid #2A2A2A',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#9AA3A8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'monospace',
              }}
            >
              <FileText size={12} /> New Registration
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                height: '34px',
                padding: '0 14px',
                background: 'transparent',
                border: '1px solid #2A2A2A',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: refreshing ? '#555' : '#9AA3A8',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'monospace',
              }}
            >
              <RefreshCw
                size={12}
                style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Bento KPI Grid ──────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {KPI.map((kpi) => (
            <BentoCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* ── Active Orders Strip ──────────────────────────────────────── */}
        <div
          style={{
            background: '#161616',
            border: '1px solid #2A2A2A',
            borderRadius: '10px',
            padding: '18px 22px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
              background: 'linear-gradient(180deg, #448AFF, #2979FF)',
              borderRadius: '10px 0 0 10px',
            }}
          />
          <div style={{ paddingLeft: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Truck size={13} style={{ color: '#448AFF' }} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#448AFF',
                  fontFamily: 'monospace',
                }}
              >
                Active Shipments
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {ORDER_HISTORY.filter((o) => o.status === 'En Route' || o.status === 'Scheduled').map((o) => (
                <div
                  key={o.id}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    minWidth: '220px',
                    flex: '1',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9AA3A8' }}>{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <MapPin size={10} style={{ color: '#448AFF' }} />
                    <span style={{ fontSize: '12px', color: '#E0E0E0', fontWeight: 600 }}>{o.route}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <Package size={10} style={{ color: '#9AA3A8' }} />
                    <span style={{ fontSize: '11px', color: '#9AA3A8' }}>{o.cargo}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={10} style={{ color: '#FFB300' }} />
                    <span style={{ fontSize: '10px', color: '#9AA3A8', fontFamily: 'monospace' }}>
                      ETA: <span style={{ color: '#FFB300' }}>{o.eta}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Order History Table ──────────────────────────────────────── */}
        <div
          style={{
            background: '#161616',
            border: '1px solid #2A2A2A',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Table header bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px',
              borderBottom: '1px solid #2A2A2A',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={13} style={{ color: '#9AA3A8' }} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#9AA3A8',
                  fontFamily: 'monospace',
                }}
              >
                Order History
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: '#555',
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '4px',
                  padding: '1px 6px',
                }}
              >
                {filtered.length} records
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    height: '28px',
                    padding: '0 12px',
                    background: filter === f ? 'rgba(0,230,118,0.1)' : 'transparent',
                    border: `1px solid ${filter === f ? 'rgba(0,230,118,0.3)' : '#2A2A2A'}`,
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: filter === f ? '#00E676' : '#9AA3A8',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: '#1A1A1A' }}>
                  {['Order ID', 'Route', 'Cargo', 'Date', 'ETA', 'Status', 'Amount (PKR)'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#555',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #2A2A2A',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: '#555',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                    >
                      No orders match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o, idx) => (
                    <tr
                      key={o.id}
                      style={{
                        background: idx % 2 === 0 ? 'transparent' : '#1A1A1A18',
                        borderBottom: '1px solid #1E1E1E',
                        transition: 'background 0.12s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1F1F1F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#1A1A1A18'; }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#00E676', fontSize: '11px' }}>
                        {o.id}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#E0E0E0', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={10} style={{ color: '#9AA3A8', flexShrink: 0 }} />
                          {o.route}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9AA3A8' }}>{o.cargo}</td>
                      <td style={{ padding: '12px 16px', color: '#9AA3A8', fontFamily: 'monospace', fontSize: '11px' }}>
                        {o.date}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#FFB300', fontFamily: 'monospace', fontSize: '11px' }}>
                        {o.eta}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={o.status} />
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#E0E0E0' }}>
                        {o.amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '12px 22px',
              borderTop: '1px solid #1E1E1E',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
              Read-only client view &mdash; internal logistics costs not disclosed
            </span>
            <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
              Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};
