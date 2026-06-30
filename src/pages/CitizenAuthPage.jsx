import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';

// Step indicators
const STEPS = ['Phone', 'Verify', 'Details'];

export default function CitizenAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState('signup'); // 'signup' | 'login'

  // Step management (signup only)
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=details

  // Step 1 fields
  const [phone, setPhone]     = useState('');

  // Step 2 fields
  const [otp,   setOtp]       = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  // Step 3 fields
  const [name,  setName]      = useState('');
  const [pin,   setPin]       = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [location, setLocation]    = useState({
    district_id: '', sector_id: '', cell_id: '', village: ''
  });

  // Login fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin,   setLoginPin]   = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError  = (field) => setFieldErrors(p => ({ ...p, [field]: '' }));
  const setFErr     = (field, msg) => setFieldErrors(p => ({ ...p, [field]: msg }));

  // ── SIGNUP FLOW ──────────────────────────────

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!phone) return setFErr('phone', 'Phone number is required');
    setLoading(true); setError('');
    try {
      await api.post('/auth/citizen/request-otp', { phone, purpose: 'signup' });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setFErr('otp', 'Enter the 6-digit code');
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/citizen/verify-otp', { phone, code: otp });
      if (res.data.next_step === 'home') {
        // Existing user logged in
        login(res.data.token, res.data.user);
        navigate('/');
      } else {
        // New user — proceed to registration
        setVerificationToken(res.data.verification_token);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim())          errors.name       = 'Full name is required';
    if (!pin || pin.length !== 4) errors.pin     = 'PIN must be exactly 4 digits';
    if (pin !== pinConfirm)    errors.pinConfirm = 'PINs do not match';
    if (!location.district_id) errors.district_id= 'District is required';
    if (!location.sector_id)   errors.sector_id  = 'Sector is required';
    if (!location.cell_id)     errors.cell_id    = 'Cell is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors); return;
    }

    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/citizen/register', {
        verification_token: verificationToken,
        name:               name.trim(),
        pin,
        district_id:        location.district_id,
        sector_id:          location.sector_id,
        cell_id:            location.cell_id,
        village:            location.village || '',
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  // ── LOGIN FLOW ───────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginPhone) return setFErr('loginPhone', 'Phone is required');
    if (!loginPin)   return setFErr('loginPin',   'PIN is required');
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/citizen/login', {
        phone: loginPhone, pin: loginPin
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  // ── RENDER ────────────────────────────────────

  const inputClass = (hasError) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary
    ${hasError ? 'border-danger' : 'border-border'}`;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-primary">CivicPulse</Link>
          <p className="text-text-muted text-sm mt-1">Citizen Portal</p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">

          {/* Mode switcher */}
          <div className="flex bg-bg rounded-lg p-1 mb-6">
            {[['signup','Sign Up'],['login','Log In']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setStep(1); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all
                  ${mode === m
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-text-muted hover:text-text-main'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && (
            <>
              {/* Step indicators */}
              <div className="flex items-center justify-between mb-6">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${step > i + 1 ? 'bg-primary text-white'
                        : step === i + 1 ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-bg border border-border text-text-muted'}`}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`ml-2 text-xs font-medium hidden sm:block
                      ${step === i + 1 ? 'text-primary' : 'text-text-muted'}`}>
                      {label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`w-8 h-px mx-3 ${step > i + 1 ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1 — Phone */}
              {step === 1 && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text-muted font-mono">
                        +250
                      </span>
                      <input type="tel" value={phone}
                        onChange={e => { setPhone(e.target.value); clearError('phone'); }}
                        placeholder="7XXXXXXXX"
                        maxLength={9}
                        className={`flex-1 ${inputClass(fieldErrors.phone)}`}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-danger text-xs mt-1">{fieldErrors.phone}</p>
                    )}
                    <p className="text-text-muted text-xs mt-1">
                      We will send a verification code to this number.
                    </p>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                    {loading ? 'Sending…' : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {/* Step 2 — OTP */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <p className="text-sm text-text-muted mb-4">
                      Enter the 6-digit code sent to <strong>+250{phone}</strong>
                    </p>
                    <label className="block text-sm font-medium text-text-main mb-1">
                      Verification Code <span className="text-danger">*</span>
                    </label>
                    <input type="text" value={otp} maxLength={6}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); clearError('otp'); }}
                      placeholder="000000"
                      className={`w-full font-mono text-center text-2xl tracking-widest ${inputClass(fieldErrors.otp)}`}
                    />
                    {fieldErrors.otp && (
                      <p className="text-danger text-xs mt-1">{fieldErrors.otp}</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </button>
                  <button type="button" onClick={() => setStep(1)}
                    className="w-full text-sm text-text-muted hover:text-primary text-center">
                    ← Change phone number
                  </button>
                </form>
              )}

              {/* Step 3 — Details */}
              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" value={name}
                      onChange={e => { setName(e.target.value); clearError('name'); }}
                      placeholder="e.g. Amina Uwase"
                      className={inputClass(fieldErrors.name)}
                    />
                    {fieldErrors.name && (
                      <p className="text-danger text-xs mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-1">
                        4-Digit PIN <span className="text-danger">*</span>
                      </label>
                      <input type="password" value={pin} maxLength={4}
                        onChange={e => { setPin(e.target.value.replace(/\D/g,'')); clearError('pin'); }}
                        placeholder="••••"
                        className={`font-mono text-center text-xl tracking-widest ${inputClass(fieldErrors.pin)}`}
                      />
                      {fieldErrors.pin && (
                        <p className="text-danger text-xs mt-1">{fieldErrors.pin}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-1">
                        Confirm PIN <span className="text-danger">*</span>
                      </label>
                      <input type="password" value={pinConfirm} maxLength={4}
                        onChange={e => { setPinConfirm(e.target.value.replace(/\D/g,'')); clearError('pinConfirm'); }}
                        placeholder="••••"
                        className={`font-mono text-center text-xl tracking-widest ${inputClass(fieldErrors.pinConfirm)}`}
                      />
                      {fieldErrors.pinConfirm && (
                        <p className="text-danger text-xs mt-1">{fieldErrors.pinConfirm}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <LocationSelector
                      onChange={setLocation}
                      errors={fieldErrors}
                      clearError={clearError}
                    />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                    {loading ? 'Creating account…' : 'Create My Account'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text-muted">
                    +250
                  </span>
                  <input type="tel" value={loginPhone}
                    onChange={e => { setLoginPhone(e.target.value); clearError('loginPhone'); }}
                    placeholder="7XXXXXXXX" maxLength={9}
                    className={`flex-1 ${inputClass(fieldErrors.loginPhone)}`}
                  />
                </div>
                {fieldErrors.loginPhone && (
                  <p className="text-danger text-xs mt-1">{fieldErrors.loginPhone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  4-Digit PIN <span className="text-danger">*</span>
                </label>
                <input type="password" value={loginPin} maxLength={4}
                  onChange={e => { setLoginPin(e.target.value.replace(/\D/g,'')); clearError('loginPin'); }}
                  placeholder="••••"
                  className={`font-mono text-center text-xl tracking-widest ${inputClass(fieldErrors.loginPin)}`}
                />
                {fieldErrors.loginPin && (
                  <p className="text-danger text-xs mt-1">{fieldErrors.loginPin}</p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>
          )}
        </div>

        {/* Switch to official */}
        <p className="text-center text-xs text-text-muted mt-4">
          Government official?{' '}
          <Link to="/auth/official" className="text-primary hover:underline font-medium">
            Official login →
          </Link>
        </p>
      </div>
    </div>
  );
}