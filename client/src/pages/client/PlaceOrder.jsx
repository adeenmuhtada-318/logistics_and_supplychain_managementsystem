import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, Package, Weight, User, Phone, Hash, FileText,
  ChevronRight, AlertCircle, Truck, Zap, Tag, ArrowLeft,
} from 'lucide-react';
import { placeOrder } from '../../features/orders/orderSlice';

/* ─── Pakistan Location Data ─────────────────────────────────────────────── */
const PK_LOCATIONS = {
  Punjab: {
    Lahore: ['Gulberg', 'DHA', 'Model Town', 'Johar Town', 'Cantt', 'Iqbal Town', 'Wapda Town'],
    Faisalabad: ['Madina Town', 'Jinnah Colony', 'Samanabad', 'Susan Road', 'Kohinoor City'],
    Rawalpindi: ['Saddar', 'Chaklala', 'Bahria Town', 'Satellite Town', 'Committee Chowk'],
    Multan: ['Gulgasht', 'Cantt', 'Shah Rukn-e-Alam', 'Bosan Road', 'New Multan'],
    Sialkot: ['Cantt', 'Paris Road', 'Allama Iqbal Road', 'Sambrial', 'Daska'],
    Gujranwala: ['Trust Colony', 'Satellite Town', 'Model Town', 'Peoples Colony'],
  },
  Sindh: {
    Karachi: ['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'PECHS', 'Korangi', 'Malir'],
    Hyderabad: ['Latifabad', 'Qasimabad', 'Cantt', 'Hirabad', 'Naseem Nagar'],
    Sukkur: ['Rohri', 'New Sukkur', 'Minara Road', 'Bunder Road'],
  },
  'Khyber Pakhtunkhwa': {
    Peshawar: ['University Town', 'Hayatabad', 'Cantt', 'Warsak Road'],
    Abbottabad: ['Cantt', 'Mandian', 'Nawan Shehr', 'Supply Bazar'],
  },
  Balochistan: {
    Quetta: ['Satellite Town', 'Cantt', 'Jinnah Town', 'Pishin Stop'],
    Gwadar: ['New Town', 'East Bay', 'Fish Harbour', 'Airport Road'],
  },
  'Islamabad Capital Territory': {
    Islamabad: ['F-6', 'F-7', 'F-10', 'G-9', 'G-11', 'I-8', 'I-10', 'DHA', 'Bahria Town', 'Blue Area'],
  },
};

const PROVINCES = Object.keys(PK_LOCATIONS);
const getCities  = (prov) => (prov ? Object.keys(PK_LOCATIONS[prov] || {}) : []);
const getAreas   = (prov, city) => (prov && city ? PK_LOCATIONS[prov]?.[city] || [] : []);

const CARGO_TYPES = [
  'General', 'Fragile', 'Perishable / Cold Chain',
  'Hazardous', 'Heavy Machinery', 'Electronics', 'Pharmaceutical',
];

const ACCENT   = '#00E676';
const BG_MAIN  = '#0E0E0E';
const BG_CARD  = '#161616';
const BORDER   = '#2A2A2A';
const TEXT_DIM = '#9AA3A8';

/* ─── Shared Input Components ────────────────────────────────────────────── */
const FieldLabel = ({ children, required }) => (
  <label style={{
    display: 'block', fontSize: '9.5px', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: TEXT_DIM, marginBottom: '6px', fontFamily: 'monospace',
  }}>
    {children}{required && <span style={{ color: '#FF5252', marginLeft: '3px' }}>*</span>}
  </label>
);

const InputField = ({ icon: Icon, error, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon size={13} style={{
        position: 'absolute', left: '11px', top: '50%',
        transform: 'translateY(-50%)', color: error ? '#FF5252' : TEXT_DIM, pointerEvents: 'none',
      }} />
    )}
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: '#1A1A1A', border: `1px solid ${error ? '#FF5252' : BORDER}`,
        borderRadius: '7px', padding: `10px 12px 10px ${Icon ? '32px' : '12px'}`,
        color: '#E0E0E0', fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif",
        outline: 'none', transition: 'border-color 0.15s',
      }}
      onFocus={(e) => { e.target.style.borderColor = ACCENT + '88'; }}
      onBlur={(e)  => { e.target.style.borderColor = error ? '#FF5252' : BORDER; }}
    />
    {error && <p style={{ color: '#FF5252', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace' }}>{error}</p>}
  </div>
);

const SelectField = ({ icon: Icon, error, children, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon size={13} style={{
        position: 'absolute', left: '11px', top: '50%',
        transform: 'translateY(-50%)', color: TEXT_DIM, pointerEvents: 'none', zIndex: 1,
      }} />
    )}
    <select
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: '#1A1A1A', border: `1px solid ${error ? '#FF5252' : BORDER}`,
        borderRadius: '7px', padding: `10px 12px 10px ${Icon ? '32px' : '12px'}`,
        color: props.value ? '#E0E0E0' : TEXT_DIM, fontSize: '13px',
        fontFamily: "'Inter', system-ui, sans-serif", outline: 'none',
        cursor: 'pointer', appearance: 'none', transition: 'border-color 0.15s',
      }}
      onFocus={(e) => { e.target.style.borderColor = ACCENT + '88'; }}
      onBlur={(e)  => { e.target.style.borderColor = error ? '#FF5252' : BORDER; }}
    >
      {children}
    </select>
    {error && <p style={{ color: '#FF5252', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace' }}>{error}</p>}
  </div>
);

/* ─── Location Group (Province → City → Area → Street) ──────────────────── */
const LocationGroup = ({ prefix, label, values, onChange, errors }) => {
  const cities = getCities(values.province);
  const areas  = getAreas(values.province, values.city);

  const handleChange = (field, val) => {
    if (field === 'province') onChange({ province: val, city: '', area: '', streetAddress: '' });
    else if (field === 'city') onChange({ ...values, city: val, area: '', streetAddress: '' });
    else onChange({ ...values, [field]: val });
  };

  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '18px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
        background: label === 'Pickup' ? ACCENT : '#448AFF',
        borderRadius: '10px 0 0 10px',
      }} />
      <div style={{ paddingLeft: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <MapPin size={13} style={{ color: label === 'Pickup' ? ACCENT : '#448AFF' }} />
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: label === 'Pickup' ? ACCENT : '#448AFF',
            fontFamily: 'monospace',
          }}>
            {label} Location
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FieldLabel required>Province</FieldLabel>
            <SelectField
              icon={MapPin}
              value={values.province}
              onChange={(e) => handleChange('province', e.target.value)}
              error={errors?.[`${prefix}_province`]}
            >
              <option value="">Select province…</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </SelectField>
          </div>
          <div>
            <FieldLabel required>City</FieldLabel>
            <SelectField
              icon={MapPin}
              value={values.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={!values.province}
              error={errors?.[`${prefix}_city`]}
            >
              <option value="">Select city…</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </SelectField>
          </div>
          <div>
            <FieldLabel>Area / Sector</FieldLabel>
            <SelectField
              value={values.area}
              onChange={(e) => handleChange('area', e.target.value)}
              disabled={!values.city}
            >
              <option value="">Select area…</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </SelectField>
          </div>
          <div>
            <FieldLabel required>Street / Building</FieldLabel>
            <InputField
              icon={MapPin}
              placeholder="e.g. Plot 12, Main Blvd"
              value={values.streetAddress}
              onChange={(e) => handleChange('streetAddress', e.target.value)}
              error={errors?.[`${prefix}_street`]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const INITIAL_LOC = { province: '', city: '', area: '', streetAddress: '' };

export const PlaceOrder = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { submitting, error: orderError } = useSelector((s) => s.orders);

  const [pickup,  setPickup]  = useState({ ...INITIAL_LOC });
  const [dropoff, setDropoff] = useState({ ...INITIAL_LOC });
  const [form, setForm] = useState({
    cargoWeightKg:     '',
    cargoDescription:  '',
    priority:          'Standard',
    cargoType:         'General',
    contactPersonName: '',
    contactMobile:     '',
    companyNtn:        '',
    notes:             '',
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = useCallback(() => {
    const errs = {};
    if (!pickup.province)      errs.pickup_province = 'Required';
    if (!pickup.city)          errs.pickup_city      = 'Required';
    if (!pickup.streetAddress) errs.pickup_street    = 'Required';
    if (!dropoff.province)     errs.dropoff_province = 'Required';
    if (!dropoff.city)         errs.dropoff_city     = 'Required';
    if (!dropoff.streetAddress)errs.dropoff_street   = 'Required';
    if (!form.cargoWeightKg || isNaN(Number(form.cargoWeightKg)) || Number(form.cargoWeightKg) < 1)
      errs.cargoWeightKg = 'Enter a valid weight (min 1 kg)';
    if (!form.cargoDescription.trim()) errs.cargoDescription = 'Required';
    if (!form.contactPersonName.trim()) errs.contactPersonName = 'Required';
    if (!form.contactMobile.trim())     errs.contactMobile    = 'Required';
    return errs;
  }, [pickup, dropoff, form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const payload = {
      pickup:  { ...pickup },
      dropoff: { ...dropoff },
      cargoWeightKg:    Number(form.cargoWeightKg),
      cargoDescription: form.cargoDescription,
      priority:         form.priority,
      cargoType:        form.cargoType,
      contactPersonName: form.contactPersonName,
      contactMobile:     form.contactMobile,
      companyNtn:        form.companyNtn,
      notes:             form.notes,
    };

    const result = await dispatch(placeOrder(payload));
    if (placeOrder.fulfilled.match(result)) {
      // Navigate to fare receipt with order data
      const order = result.payload?.data || result.payload;
      navigate('/client/fare-receipt', { state: { order } });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG_MAIN, padding: '28px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/client/dashboard')}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '6px',
              padding: '6px 10px', color: TEXT_DIM, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
            }}
          >
            <ArrowLeft size={12} /> Back
          </button>
          <div style={{
            width: '38px', height: '38px', borderRadius: '9px',
            background: ACCENT + '18', border: `1px solid ${ACCENT}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Truck size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#E0E0E0' }}>
              Place Delivery Order
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: TEXT_DIM, fontFamily: 'monospace' }}>
              Auto-calculated fare · Dummy payment · Rider opt-in broadcast
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Locations */}
            <LocationGroup prefix="pickup"  label="Pickup"  values={pickup}  onChange={setPickup}  errors={errors} />
            <LocationGroup prefix="dropoff" label="Drop-off" values={dropoff} onChange={setDropoff} errors={errors} />

            {/* Cargo Details */}
            <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Package size={13} style={{ color: '#FFB300' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFB300', fontFamily: 'monospace' }}>
                  Cargo Details
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <FieldLabel required>Cargo Description</FieldLabel>
                  <InputField
                    icon={Package}
                    placeholder="e.g. Textile Bales, Machinery Parts"
                    value={form.cargoDescription}
                    onChange={setField('cargoDescription')}
                    error={errors.cargoDescription}
                  />
                </div>
                <div>
                  <FieldLabel required>Cargo Weight (KG)</FieldLabel>
                  <InputField
                    icon={Weight || Package}
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={form.cargoWeightKg}
                    onChange={setField('cargoWeightKg')}
                    error={errors.cargoWeightKg}
                  />
                </div>
                <div>
                  <FieldLabel>Cargo Type / Handling Tag</FieldLabel>
                  <SelectField
                    icon={Tag}
                    value={form.cargoType}
                    onChange={setField('cargoType')}
                  >
                    {CARGO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </SelectField>
                </div>
                <div>
                  <FieldLabel required>Priority Level</FieldLabel>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Standard', 'Express'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, priority: p }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '7px',
                          border: `1px solid ${form.priority === p ? (p === 'Express' ? '#448AFF' : ACCENT) : BORDER}`,
                          background: form.priority === p
                            ? (p === 'Express' ? 'rgba(68,138,255,0.1)' : ACCENT + '18')
                            : '#1A1A1A',
                          color: form.priority === p
                            ? (p === 'Express' ? '#448AFF' : ACCENT)
                            : TEXT_DIM,
                          fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {p === 'Express' && <Zap size={11} />}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <User size={13} style={{ color: '#E040FB' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E040FB', fontFamily: 'monospace' }}>
                  Contact Details
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <FieldLabel required>Contact Person Name</FieldLabel>
                  <InputField
                    icon={User}
                    placeholder="Full name"
                    value={form.contactPersonName}
                    onChange={setField('contactPersonName')}
                    error={errors.contactPersonName}
                  />
                </div>
                <div>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <InputField
                    icon={Phone}
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    value={form.contactMobile}
                    onChange={setField('contactMobile')}
                    error={errors.contactMobile}
                  />
                </div>
                <div>
                  <FieldLabel>Company NTN <span style={{ color: TEXT_DIM, fontWeight: 400 }}>(optional)</span></FieldLabel>
                  <InputField
                    icon={Hash}
                    placeholder="e.g. 1234567-0"
                    value={form.companyNtn}
                    onChange={setField('companyNtn')}
                  />
                </div>
                <div>
                  <FieldLabel>Notes / Instructions <span style={{ color: TEXT_DIM, fontWeight: 400 }}>(optional)</span></FieldLabel>
                  <InputField
                    icon={FileText}
                    placeholder="Special handling, access codes…"
                    value={form.notes}
                    onChange={setField('notes')}
                  />
                </div>
              </div>
            </div>

            {/* API Error Banner */}
            {orderError && (
              <div style={{
                background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.25)',
                borderRadius: '8px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <AlertCircle size={14} style={{ color: '#FF5252', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#FF5252', fontFamily: 'monospace' }}>{orderError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '14px',
                background: submitting ? '#1A1A1A' : `linear-gradient(135deg, ${ACCENT}, #00C853)`,
                border: 'none', borderRadius: '8px',
                color: submitting ? TEXT_DIM : '#0A0A0A',
                fontWeight: 800, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', letterSpacing: '0.02em',
              }}
            >
              {submitting ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '16px' }}>⚙</span>
                  Calculating Route & Fare…
                </>
              ) : (
                <>
                  <ChevronRight size={16} />
                  Calculate Fare & Place Order
                </>
              )}
            </button>

          </div>
        </form>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          select option { background: #1A1A1A; color: #E0E0E0; }
        `}</style>
      </div>
    </div>
  );
};
