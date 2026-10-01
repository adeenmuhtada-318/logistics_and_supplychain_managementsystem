import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Hash,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/* ─── Pakistan Cascading Location Data ──────────────────────────────────── */
const PK_LOCATIONS = {
  Punjab: {
    Lahore: ['Gulberg', 'DHA', 'Model Town', 'Johar Town', 'Cantt', 'Iqbal Town', 'Wapda Town'],
    Faisalabad: ['Madina Town', 'Jinnah Colony', 'Samanabad', 'Susan Road', 'Kohinoor City'],
    Rawalpindi: ['Saddar', 'Chaklala', 'Bahria Town', 'Satellite Town', 'Committee Chowk'],
    Multan: ['Gulgasht', 'Cantt', 'Shah Rukn-e-Alam', 'Bosan Road', 'New Multan'],
    Sialkot: ['Cantt', 'Paris Road', 'Allama Iqbal Road', 'Sambrial', 'Daska'],
    Gujranwala: ['Trust Colony', 'Satellite Town', 'Model Town', 'Peoples Colony', 'Wapda Town'],
  },
  Sindh: {
    Karachi: ['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'PECHS', 'Korangi', 'Malir', 'Surjani Town'],
    Hyderabad: ['Latifabad', 'Qasimabad', 'Cantt', 'Hirabad', 'Naseem Nagar'],
    Sukkur: ['Rohri', 'New Sukkur', 'Minara Road', 'Bunder Road', 'Airport Road'],
    Larkana: ['Cantt', 'Station Road', 'Civic Centre', 'New Larkana', 'Wapda Colony'],
  },
  'Khyber Pakhtunkhwa': {
    Peshawar: ['University Town', 'Hayatabad', 'Cantt', 'Warsak Road', 'Ring Road'],
    Abbottabad: ['Cantt', 'Mandian', 'Nawan Shehr', 'Supply Bazar', 'Kaghan Colony'],
    Mardan: ['Cantt', 'Industrial Estate', 'Hoti', 'Takht Bhai', 'Katlang Road'],
    Swat: ['Mingora', 'Saidu Sharif', 'Matta', 'Khwazakhela', 'Bahrain'],
  },
  Balochistan: {
    Quetta: ['Satellite Town', 'Cantt', 'Jinnah Town', 'Pishin Stop', 'Brewery Road'],
    Gwadar: ['New Town', 'East Bay', 'Fish Harbour', 'Airport Road', 'Surbandar'],
    Turbat: ['Airport Road', 'Shahi Bazar', 'New Turbat', 'Sami Town', 'Mand Road'],
  },
  'Islamabad Capital Territory': {
    Islamabad: ['F-6', 'F-7', 'F-10', 'G-9', 'G-11', 'I-8', 'I-10', 'DHA', 'Bahria Town', 'Blue Area'],
  },
  'Azad Kashmir': {
    Muzaffarabad: ['Khuiratta', 'Chinari', 'Garhi Dupatta', 'City Centre', 'Neelum Road'],
    Mirpur: ['New Mirpur', 'Ali Abad', 'Allama Iqbal Road', 'Royal Orchard', 'PAF Road'],
  },
  'Gilgit-Baltistan': {
    Gilgit: ['Jutial', 'Konodas', 'Danyore', 'Oshikhandas', 'Nomal'],
    Skardu: ['Naya Bazar', 'Old Bazar', 'Kachura', 'Shigar Road', 'Airport Road'],
  },
};

/* ─── Styled sub-components ─────────────────────────────────────────────── */
const CNLabel = ({ children }) => (
  <label
    style={{
      display: 'block',
      fontSize: '9.5px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#9AA3A8',
      marginBottom: '6px',
      fontFamily: 'monospace',
    }}
  >
    {children}
  </label>
);

const CNInput = ({ icon: Icon, error, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon
        size={13}
        style={{
          position: 'absolute',
          left: '11px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: error ? '#FF5252' : '#9AA3A8',
          pointerEvents: 'none',
        }}
      />
    )}
    <input
      {...props}
      style={{
        width: '100%',
        height: '38px',
        background: '#1A1A1A',
        border: `1px solid ${error ? '#FF5252' : '#2A2A2A'}`,
        borderRadius: '6px',
        paddingLeft: Icon ? '32px' : '12px',
        paddingRight: '12px',
        fontSize: '13px',
        color: '#E0E0E0',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = error ? '#FF5252' : '#00E676';
        e.target.style.boxShadow = `0 0 0 2px ${error ? 'rgba(255,82,82,0.15)' : 'rgba(0,230,118,0.1)'}`;
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? '#FF5252' : '#2A2A2A';
        e.target.style.boxShadow = 'none';
        if (props.onBlur) props.onBlur(e);
      }}
    />
    {error && (
      <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#FF5252', fontFamily: 'monospace' }}>
        {error}
      </p>
    )}
  </div>
);

const CNSelect = ({ icon: Icon, error, children, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon
        size={13}
        style={{
          position: 'absolute',
          left: '11px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: error ? '#FF5252' : '#9AA3A8',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    )}
    <select
      {...props}
      style={{
        width: '100%',
        height: '38px',
        background: '#1A1A1A',
        border: `1px solid ${error ? '#FF5252' : '#2A2A2A'}`,
        borderRadius: '6px',
        paddingLeft: Icon ? '32px' : '12px',
        paddingRight: '28px',
        fontSize: '13px',
        color: props.value ? '#E0E0E0' : '#555',
        fontFamily: 'inherit',
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
        ...(props.style || {}),
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#00E676';
        e.target.style.boxShadow = '0 0 0 2px rgba(0,230,118,0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? '#FF5252' : '#2A2A2A';
        e.target.style.boxShadow = 'none';
      }}
    >
      {children}
    </select>
    <ChevronRight
      size={12}
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%) rotate(90deg)',
        color: '#555',
        pointerEvents: 'none',
      }}
    />
    {error && (
      <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#FF5252', fontFamily: 'monospace' }}>
        {error}
      </p>
    )}
  </div>
);

const SectionHead = ({ icon: Icon, label, accent = '#00E676' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      paddingBottom: '10px',
      borderBottom: '1px solid #2A2A2A',
    }}
  >
    <Icon size={14} style={{ color: accent }} />
    <span
      style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: accent,
        fontFamily: 'monospace',
      }}
    >
      {label}
    </span>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const ClientRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    ntn: '',
    phone: '',
    email: '',
    province: '',
    city: '',
    area: '',
    streetAddress: '',
    businessType: '',
    yearsInOperation: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const cities = form.province ? Object.keys(PK_LOCATIONS[form.province] || {}) : [];
  const areas = form.province && form.city ? PK_LOCATIONS[form.province]?.[form.city] || [] : [];

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'province') { updated.city = ''; updated.area = ''; }
      if (name === 'city') { updated.area = ''; }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.ownerName.trim()) e.ownerName = 'Owner / authorized person is required';
    if (!form.ntn.match(/^\d{7}-\d$/)) e.ntn = 'NTN format: 1234567-0';
    if (!form.phone.match(/^(\+92|0)?3\d{9}$/)) e.phone = 'Enter a valid Pakistani mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.province) e.province = 'Select a province';
    if (!form.city) e.city = 'Select a city';
    if (!form.area) e.area = 'Select an area';
    if (!form.streetAddress.trim()) e.streetAddress = 'Street address is required';
    if (!form.businessType) e.businessType = 'Select business type';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  /* ── Success Screen ─────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: '#161616',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            padding: '48px 40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0,230,118,0.1)',
              border: '1px solid rgba(0,230,118,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle2 size={28} style={{ color: '#00E676' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E0E0E0', marginBottom: '8px' }}>
            Application Submitted
          </h2>
          <p style={{ fontSize: '13px', color: '#9AA3A8', lineHeight: 1.6, marginBottom: '24px' }}>
            <strong style={{ color: '#00E676' }}>{form.companyName}</strong> has been registered as a B2B
            client. Our team will review and activate your portal access within 24 hours.
          </p>
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '12px 16px',
              textAlign: 'left',
              marginBottom: '24px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#9AA3A8',
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              NTN: <span style={{ color: '#00E676' }}>{form.ntn}</span>
            </div>
            <div style={{ marginBottom: '4px' }}>
              Contact: <span style={{ color: '#E0E0E0' }}>{form.email}</span>
            </div>
            <div>
              Office: <span style={{ color: '#E0E0E0' }}>{form.area}, {form.city}, {form.province}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/client/dashboard')}
            style={{
              width: '100%',
              height: '40px',
              background: 'linear-gradient(135deg, #00E676, #00BFA5)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0D1F1A',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            Go to Client Dashboard &rarr;
          </button>
        </div>
      </div>
    );
  }

  /* ── Registration Form ──────────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0E0E0E 0%, #111 50%, #131313 100%)',
        padding: '32px 16px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0,230,118,0.1)',
                border: '1px solid rgba(0,230,118,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={16} style={{ color: '#00E676' }} />
            </div>
            <div>
              <p
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#00E676',
                  fontFamily: 'monospace',
                  marginBottom: '1px',
                }}
              >
                B2B Client Portal
              </p>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#E0E0E0', margin: 0 }}>
                Corporate Onboarding
              </h1>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#9AA3A8', marginTop: '8px' }}>
            Register your business to access freight, dispatch, and route management services.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Section 1: Company Identity */}
            <div
              style={{
                background: '#161616',
                border: '1px solid #2A2A2A',
                borderRadius: '10px',
                padding: '22px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
                  background: 'linear-gradient(180deg, #00E676, #00BFA5)',
                  borderRadius: '10px 0 0 10px',
                }}
              />
              <div style={{ paddingLeft: '4px' }}>
                <SectionHead icon={Building2} label="Company Identity" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <CNLabel>Company / Corporate Name *</CNLabel>
                    <CNInput
                      icon={Building2}
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Pak Freight Solutions (Pvt.) Ltd."
                      error={errors.companyName}
                    />
                  </div>
                  <div>
                    <CNLabel>Owner / Authorized Person *</CNLabel>
                    <CNInput
                      icon={User}
                      name="ownerName"
                      value={form.ownerName}
                      onChange={handleChange}
                      placeholder="Full legal name"
                      error={errors.ownerName}
                    />
                  </div>
                  <div>
                    <CNLabel>NTN (National Tax Number) *</CNLabel>
                    <CNInput
                      icon={Hash}
                      name="ntn"
                      value={form.ntn}
                      onChange={handleChange}
                      placeholder="1234567-0"
                      maxLength={9}
                      error={errors.ntn}
                    />
                  </div>
                  <div>
                    <CNLabel>Business Type *</CNLabel>
                    <CNSelect
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      error={errors.businessType}
                    >
                      <option value="">Select category&hellip;</option>
                      <option>Manufacturing</option>
                      <option>Retail / Wholesale</option>
                      <option>Agriculture &amp; FMCG</option>
                      <option>Construction &amp; Materials</option>
                      <option>Pharmaceuticals</option>
                      <option>Textile &amp; Apparel</option>
                      <option>Technology &amp; Electronics</option>
                      <option>Other</option>
                    </CNSelect>
                  </div>
                  <div>
                    <CNLabel>Years in Operation</CNLabel>
                    <CNSelect
                      name="yearsInOperation"
                      value={form.yearsInOperation}
                      onChange={handleChange}
                    >
                      <option value="">Select range&hellip;</option>
                      <option>Less than 1 year</option>
                      <option>1&ndash;3 years</option>
                      <option>3&ndash;5 years</option>
                      <option>5&ndash;10 years</option>
                      <option>10+ years</option>
                    </CNSelect>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div
              style={{
                background: '#161616',
                border: '1px solid #2A2A2A',
                borderRadius: '10px',
                padding: '22px 24px',
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
                <SectionHead icon={Phone} label="Contact Information" accent="#448AFF" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <CNLabel>Mobile / WhatsApp *</CNLabel>
                    <CNInput
                      icon={Phone}
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+92 3XX XXXXXXX"
                      error={errors.phone}
                    />
                  </div>
                  <div>
                    <CNLabel>Corporate Email *</CNLabel>
                    <CNInput
                      icon={Mail}
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="accounts@company.com.pk"
                      error={errors.email}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Registered Office Address */}
            <div
              style={{
                background: '#161616',
                border: '1px solid #2A2A2A',
                borderRadius: '10px',
                padding: '22px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
                  background: 'linear-gradient(180deg, #FFB300, #FF8F00)',
                  borderRadius: '10px 0 0 10px',
                }}
              />
              <div style={{ paddingLeft: '4px' }}>
                <SectionHead icon={MapPin} label="Registered Office Address" accent="#FFB300" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px',
                    padding: '8px 12px',
                    background: 'rgba(255,179,0,0.05)',
                    border: '1px solid rgba(255,179,0,0.15)',
                    borderRadius: '6px',
                  }}
                >
                  <AlertCircle size={11} style={{ color: '#FFB300', flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: '#9AA3A8', fontFamily: 'monospace' }}>
                    Select Province &rarr; City &rarr; Area in sequence. Fields unlock progressively.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <CNLabel>Province / Territory *</CNLabel>
                    <CNSelect
                      icon={MapPin}
                      name="province"
                      value={form.province}
                      onChange={handleChange}
                      error={errors.province}
                    >
                      <option value="">Select province&hellip;</option>
                      {Object.keys(PK_LOCATIONS).map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </CNSelect>
                  </div>

                  <div>
                    <CNLabel>City *</CNLabel>
                    <CNSelect
                      icon={MapPin}
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      disabled={!form.province}
                      error={errors.city}
                      style={{ opacity: !form.province ? 0.45 : 1 }}
                    >
                      <option value="">Select city&hellip;</option>
                      {cities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </CNSelect>
                  </div>

                  <div>
                    <CNLabel>Area / Locality *</CNLabel>
                    <CNSelect
                      icon={MapPin}
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      disabled={!form.city}
                      error={errors.area}
                      style={{ opacity: !form.city ? 0.45 : 1 }}
                    >
                      <option value="">Select area&hellip;</option>
                      {areas.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </CNSelect>
                  </div>
                </div>

                <CNLabel>Street Address / Plot No. *</CNLabel>
                <CNInput
                  icon={MapPin}
                  name="streetAddress"
                  value={form.streetAddress}
                  onChange={handleChange}
                  placeholder="Plot #14, Block C, Industrial Zone"
                  error={errors.streetAddress}
                />

                {form.area && form.city && form.province && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#9AA3A8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <MapPin size={10} style={{ color: '#FFB300' }} />
                    <span>
                      {form.streetAddress ? form.streetAddress + ', ' : ''}
                      <span style={{ color: '#FFB300' }}>{form.area}</span>
                      {' \u00b7 '}{form.city}{' \u00b7 '}{form.province}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                background: loading
                  ? '#1A1A1A'
                  : 'linear-gradient(135deg, #00E676 0%, #00BFA5 100%)',
                border: loading ? '1px solid #2A2A2A' : 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                color: loading ? '#555' : '#0D1F1A',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Registering Corporate Account&hellip;
                </>
              ) : (
                <>
                  <Building2 size={14} />
                  Submit Corporate Registration
                </>
              )}
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

          </div>
        </form>
      </div>
    </div>
  );
};
