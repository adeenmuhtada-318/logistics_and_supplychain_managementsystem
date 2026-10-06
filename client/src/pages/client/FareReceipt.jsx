import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle2, MapPin, Package, Ruler, Clock, DollarSign,
  CreditCard, Copy, ArrowRight, AlertCircle, Truck, Banknote,
  ArrowLeft,
} from 'lucide-react';
import { confirmPayment, fetchOrders, clearOrderError } from '../../features/orders/orderSlice';
import { calculateFare } from './PlaceOrder';

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const ACCENT  = '#00E676';
const BG_MAIN = '#0E0E0E';
const BG_CARD = '#161616';
const BORDER  = '#2A2A2A';
const DIM     = '#9AA3A8';

/* ─── Dummy Payment Account ──────────────────────────────────────────────── */
const DUMMY_ACCOUNT = {
  bank:          'Meezan Bank Ltd.',
  accountTitle:  'FleetCore Logistics (Pvt.) Ltd.',
  accountNumber: '0123-4567890-01',
  iban:          'PK36MEZN0001230100001111',
};

/* ─── Receipt Line Row ───────────────────────────────────────────────────── */
const ReceiptRow = ({ label, value, accent, mono }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: `1px solid ${BORDER}18`,
  }}>
    <span style={{ fontSize: '12px', color: DIM }}>{label}</span>
    <span style={{
      fontSize: '13px', fontWeight: accent ? 800 : 600,
      color: accent || '#E0E0E0',
      fontFamily: mono ? 'monospace' : "'Inter', system-ui, sans-serif",
    }}>
      {value}
    </span>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const FareReceipt = () => {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const { submitting, error: paymentError, selectedOrder } = useSelector((s) => s.orders);

  const order = state?.order || selectedOrder;
  const orderId = state?.orderId || order?._id;
  const pickupCity = state?.pickupCity || order?.pickup?.city;
  const dropoffCity = state?.dropoffCity || order?.dropoff?.city;
  const weightKg = Number(state?.cargoWeight ?? order?.cargoWeightKg ?? 0);
  const transitHours = Number(state?.transitHours ?? (Number(order?.calculatedDistanceKm) > 0 ? Math.max(1, Math.round(Number(order.calculatedDistanceKm) / 60)) : 0));
  const calculatedFare = useMemo(() => {
    if (!order) return null;
    return order.fareBreakdown?.totalFare > 0
      ? order.fareBreakdown
      : calculateFare({
        pickupCity,
        dropoffCity,
        cargoWeightKg: weightKg,
        priority: order.priority,
      });
  }, [order, pickupCity, dropoffCity, weightKg]);
  const [copied,   setCopied]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearOrderError());
  }, [dispatch]);

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: BG_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center', color: DIM }}>
          <button onClick={() => navigate(-1)} aria-label="Go back" style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '7px', color: DIM, cursor: 'pointer', display: 'inline-flex', marginBottom: '12px' }}><ArrowLeft size={14} /></button>
          <AlertCircle size={40} style={{ marginBottom: '12px' }} />
          <p>No order data found. <button onClick={() => navigate('/client/place-order')} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Place a new order</button></p>
        </div>
      </div>
    );
  }

  const fb = calculatedFare || {};
  const distanceKm = Number(order.calculatedDistanceKm) > 0 ? Number(order.calculatedDistanceKm) : (calculatedFare?.distanceKm || 0);
  const distKm    = distanceKm > 0 ? distanceKm.toFixed(1) : '—';
  const totalFare = Number(fb.totalFare || order.estimatedFarePKR || 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(DUMMY_ACCOUNT.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (submitting || confirmed) return;
    if (!orderId) {
      setLocalError('This order has no database ID. Please place the order again.');
      return;
    }
    setLocalError('');
    const result = await dispatch(confirmPayment(orderId));
    if (confirmPayment.fulfilled.match(result)) {
      setConfirmed(true);
      dispatch(fetchOrders());
      setTimeout(() => navigate('/client/dashboard', { replace: true }), 1500);
    } else {
      setLocalError(result.payload || 'Payment confirmation failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, padding: '28px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '6px 10px', color: DIM, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', marginBottom: '16px' }}>
          <ArrowLeft size={12} /> Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 14px',
            background: ACCENT + '18', border: `1px solid ${ACCENT}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Truck size={24} style={{ color: ACCENT }} />
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#E0E0E0' }}>
            Auto-Calculated Fare Receipt
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: DIM, fontFamily: 'monospace' }}>
            Order ID: {orderId || order.orderNumber || 'Unavailable'}
          </p>
        </div>

        {/* Route Summary Card */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MapPin size={13} style={{ color: ACCENT }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, fontFamily: 'monospace' }}>
              Route Summary
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: DIM, fontFamily: 'monospace', marginBottom: '3px' }}>PICKUP</div>
              <div style={{ fontSize: '13px', color: '#E0E0E0', fontWeight: 600 }}>
                {pickupCity}, {order.pickup?.province}
              </div>
              <div style={{ fontSize: '11px', color: DIM }}>{order.pickup?.streetAddress}</div>
            </div>
            <ArrowRight size={16} style={{ color: DIM, marginTop: '14px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: DIM, fontFamily: 'monospace', marginBottom: '3px' }}>DROP-OFF</div>
              <div style={{ fontSize: '13px', color: '#E0E0E0', fontWeight: 600 }}>
                {dropoffCity}, {order.dropoff?.province}
              </div>
              <div style={{ fontSize: '11px', color: DIM }}>{order.dropoff?.streetAddress}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              flex: 1, background: '#1A1A1A', border: `1px solid ${BORDER}`,
              borderRadius: '8px', padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Ruler size={12} style={{ color: '#448AFF' }} />
              <div>
                <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace' }}>DISTANCE</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#448AFF', fontFamily: 'monospace' }}>{distKm} km</div>
              </div>
            </div>
            <div style={{
              flex: 1, background: '#1A1A1A', border: `1px solid ${BORDER}`,
              borderRadius: '8px', padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Clock size={12} style={{ color: '#FFB300' }} />
              <div>
                <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace' }}>EST. TRANSIT</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFB300', fontFamily: 'monospace' }}>{transitHours > 0 ? transitHours : '—'} hr</div>
              </div>
            </div>
            <div style={{
              flex: 1, background: '#1A1A1A', border: `1px solid ${BORDER}`,
              borderRadius: '8px', padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Package size={12} style={{ color: '#E040FB' }} />
              <div>
                <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace' }}>WEIGHT</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#E040FB', fontFamily: 'monospace' }}>{weightKg > 0 ? weightKg : '—'} kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Breakdown Card */}
        <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <DollarSign size={13} style={{ color: '#FFB300' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFB300', fontFamily: 'monospace' }}>
              Fare Breakdown
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: '9px', fontFamily: 'monospace',
              color: order.priority === 'Express' ? '#448AFF' : ACCENT,
              background: order.priority === 'Express' ? 'rgba(68,138,255,0.1)' : ACCENT + '18',
              border: `1px solid ${order.priority === 'Express' ? '#448AFF' : ACCENT}30`,
              borderRadius: '4px', padding: '2px 7px', fontWeight: 700,
            }}>
              {order.priority}
            </span>
          </div>
          <ReceiptRow label="Base Fare (Distance × Rate)" value={`₨ ${(fb.baseFare || 0).toLocaleString('en-PK')}`} />
          <ReceiptRow label="Priority Premium" value={`₨ ${(fb.priorityPremium || 0).toLocaleString('en-PK')}`} />
          <ReceiptRow label="Weight Surcharge" value={`₨ ${(fb.weightSurcharge || 0).toLocaleString('en-PK')}`} />
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BORDER}` }}>
            <ReceiptRow
              label="TOTAL ESTIMATED FARE"
              value={`₨ ${totalFare.toLocaleString('en-PK')}`}
              accent={ACCENT}
              mono
            />
          </div>
          <div style={{ marginTop: '8px', padding: '8px', background: ACCENT + '08', borderRadius: '6px', border: `1px dashed ${ACCENT}30` }}>
            <p style={{ margin: 0, fontSize: '10px', color: DIM, fontFamily: 'monospace' }}>
              * Final fare may vary slightly based on actual measured distance at delivery.
              Currency: PKR
            </p>
          </div>
        </div>

        {/* Dummy Payment Card */}
        {!confirmed ? (
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CreditCard size={13} style={{ color: '#FF9800' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF9800', fontFamily: 'monospace' }}>
                Payment — Transfer Amount
              </span>
            </div>

            {/* Dummy bank account display */}
            <div style={{ background: '#1A1A1A', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace', marginBottom: '3px' }}>BANK</div>
                  <div style={{ fontSize: '12px', color: '#E0E0E0', fontWeight: 600 }}>{DUMMY_ACCOUNT.bank}</div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace', marginBottom: '3px' }}>ACCOUNT TITLE</div>
                  <div style={{ fontSize: '12px', color: '#E0E0E0', fontWeight: 600 }}>{DUMMY_ACCOUNT.accountTitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace', marginBottom: '3px' }}>ACCOUNT NUMBER</div>
                  <div style={{ fontSize: '15px', color: ACCENT, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {DUMMY_ACCOUNT.accountNumber}
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? ACCENT + '18' : '#222', border: `1px solid ${copied ? ACCENT : BORDER}`,
                    borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: copied ? ACCENT : DIM, fontSize: '10px', fontFamily: 'monospace',
                    transition: 'all 0.15s',
                  }}
                >
                  <Copy size={11} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '9px', color: DIM, fontFamily: 'monospace', marginBottom: '3px' }}>IBAN</div>
                <div style={{ fontSize: '11px', color: '#E0E0E0', fontFamily: 'monospace' }}>{DUMMY_ACCOUNT.iban}</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,152,0,0.06)', border: '1px solid rgba(255,152,0,0.2)',
              borderRadius: '7px', padding: '10px 12px', marginBottom: '14px',
              display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <Banknote size={13} style={{ color: '#FF9800', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#FF9800', fontFamily: 'monospace', lineHeight: 1.5 }}>
                Transfer <strong>₨ {totalFare.toLocaleString('en-PK')}</strong> to the above account.
                Once sent, click <strong>Confirm Payment</strong> to dispatch your order to available riders.
                <br /><em style={{ opacity: 0.75 }}>Note: This is a demo payment bypass — no live gateway is integrated.</em>
              </p>
            </div>

            {(localError || paymentError) && (
              <div style={{
                background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.25)',
                borderRadius: '7px', padding: '10px 12px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <AlertCircle size={13} style={{ color: '#FF5252' }} />
                <span style={{ fontSize: '11px', color: '#FF5252', fontFamily: 'monospace' }}>{localError || paymentError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={submitting}
              style={{
                width: '100%', padding: '14px',
                background: submitting ? '#1A1A1A' : 'linear-gradient(135deg, #FF9800, #F57C00)',
                border: 'none', borderRadius: '8px',
                color: submitting ? DIM : '#fff',
                fontWeight: 800, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? (
                <>
                  <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⚙</span>
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Confirm Payment · Dispatch Order
                </>
              )}
            </button>
          </div>
        ) : (
          // Success State
          <div style={{
            background: ACCENT + '08', border: `1px solid ${ACCENT}30`,
            borderRadius: '12px', padding: '28px', textAlign: 'center',
          }}>
            <CheckCircle2 size={42} style={{ color: ACCENT, marginBottom: '12px' }} />
            <h2 style={{ margin: '0 0 8px', color: '#E0E0E0', fontSize: '18px', fontWeight: 800 }}>
              Payment Confirmed!
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: DIM, fontFamily: 'monospace' }}>
              Your order has been dispatched to available riders.<br />
              Redirecting to dashboard…
            </p>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
