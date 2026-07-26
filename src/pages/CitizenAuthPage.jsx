import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';

// Two steps now: DETAILS → OTP → PIN
const STEPS = ['Your Details', 'Verify Phone', 'Set PIN'];

export default function CitizenAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [step, setStep] = useState(1);        // 1=details, 2=otp, 3=pin

  // Step 1 — Details
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [location, setLocation] = useState({
    district_id: '', sector_id: '', cell_id: '', village: ''
  });

  // Step 2 — OTP
  const [otp,   setOtp]   = useState('');
  // FIX: this was never captured before, even though the backend's
  // register endpoint requires it (see below). Filled in from the
  // verify-otp response in handleVerifyOTP, sent back in handleRegister.
  const [verificationToken, setVerificationToken] = useState('');

  // Step 3 — PIN
  const [pin,        setPin]        = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  // Login fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin,   setLoginPin]   = useState('');

  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError  = (f) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const inputClass = (hasError) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary
    ${hasError ? 'border-danger' : 'border-border'}`;

  // ── STEP 1: Submit details → send OTP ────────────────────────
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim())          errors.name        = 'Full name is required';
    if (!phone.trim())         errors.phone       = 'Phone number is required';
    if (!location.district_id) errors.district_id = 'District is required';
    if (!location.sector_id)   errors.sector_id   = 'Sector is required';
    if (!location.cell_id)     errors.cell_id     = 'Cell is required';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true); setError('');
    try {
      await api.post('/auth/citizen/request-otp', {
        phone,
        purpose: 'signup',
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send OTP. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setFieldErrors({ otp: 'Enter the 6-digit code' });
      return;
    }
    setLoading(true); setError('');
    try {
      // Normalize phone for the backend
      const normalizedPhone = phone.startsWith('+')
        ? phone
        : phone.startsWith('0')
          ? '+250' + phone.slice(1)
          : '+250' + phone;

      const res = await api.post('/auth/citizen/verify-otp', {
        phone: normalizedPhone,
        code:  otp,
      });

      // FIX: this used to check `next_step === 'home'` to auto-login an
      // existing user with a fresh token — but the backend no longer ever
      // returns that (see authController.js: OTP-only login without a PIN
      // was a security bypass and was removed; existing users now get
      // next_step: 'login' and no token at all, and must use the normal
      // phone+PIN login). This branch is updated to match, and — the
      // actual bug being fixed here — the verification_token for NEW users
      // is now captured into state so it can be sent along with
      // /citizen/register, which requires it.
      if (res.data.next_step === 'login') {
        // Existing account — send them to the login form instead of
        // silently failing at the register step further down.
        setMode('login');
        setStep(1);
        setError('This number already has an account — please log in with your PIN below.');
      } else {
        // New user — store the verification token and proceed to PIN setup
        setVerificationToken(res.data.verification_token);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP without losing details
  const handleResendOTP = async () => {
    setLoading(true); setError(''); setOtp('');
    try {
      await api.post('/auth/citizen/request-otp', { phone, purpose: 'signup' });
      setError(''); // clear any previous error
      setFieldErrors({});
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Set PIN → complete registration ───────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pin || pin.length !== 4)  errors.pin        = 'PIN must be exactly 4 digits';
    if (pin !== pinConfirm)        errors.pinConfirm = 'PINs do not match';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true); setError('');
    try {
      const normalizedPhone = phone.startsWith('+')
        ? phone
        : phone.startsWith('0')
          ? '+250' + phone.slice(1)
          : '+250' + phone;

      const res = await api.post('/auth/citizen/register', {
        name:        name.trim(),
        pin,
        district_id: location.district_id,
        sector_id:   location.sector_id,
        cell_id:     location.cell_id,
        village:     location.village || '',
        phone:       normalizedPhone,
        // FIX: this was missing entirely. The backend requires a valid,
        // unexpired verification_token (a short-lived JWT proving this
        // phone actually completed OTP verification) and rejects
        // registration without one — "Phone verification is required
        // before registering". It's captured in handleVerifyOTP above.
        verification_token: verificationToken,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN ─────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!loginPhone) errors.loginPhone = 'Phone is required';
    if (!loginPin)   errors.loginPin   = 'PIN is required';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true); setError('');
    try {
      const normalizedPhone = loginPhone.startsWith('+')
        ? loginPhone
        : loginPhone.startsWith('0')
          ? '+250' + loginPhone.slice(1)
          : '+250' + loginPhone;

      const res = await api.post('/auth/citizen/login', {
        phone: normalizedPhone,
        pin:   loginPin,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-primary">CivicPulse</Link>
          <p className="text-text-muted text-sm mt-1">Citizen Portal</p>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">

          {/* Mode switcher */}
          <div className="flex bg-bg rounded-lg p-1 mb-6">
            {[['signup','Sign Up'],['login','Log In']].map(([m, label]) => (
              <button key={m}
                onClick={() => { setMode(m); setError(''); setStep(1); setFieldErrors({}); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all
                  ${mode === m
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-text-muted hover:text-text-main'}`}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${step > i + 1  ? 'bg-primary text-white'
                        : step === i + 1 ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-bg border border-border text-text-muted'}`}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`ml-1.5 text-xs font-medium hidden sm:block
                      ${step === i + 1 ? 'text-primary' : 'text-text-muted'}`}>
                      {label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`w-6 h-px mx-2 ${step > i + 1 ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── Step 1: Details ── */}
              {step === 1 && (
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" value={name}
                      onChange={e => { setName(e.target.value); clearError('name'); }}
                      placeholder="e.g. Amina Uwase"
                      className={inputClass(fieldErrors.name)}
                    />
                    {fieldErrors.name && <p className="text-danger text-xs mt-1">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text-muted font-mono">
                        +250
                      </span>
                      <input type="tel" value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g,'')); clearError('phone'); }}
                        placeholder="7XXXXXXXX" maxLength={9}
                        className={`flex-1 ${inputClass(fieldErrors.phone)}`}
                      />
                    </div>
                    {fieldErrors.phone && <p className="text-danger text-xs mt-1">{fieldErrors.phone}</p>}
                    <p className="text-text-muted text-xs mt-1">
                      We will send a verification code to this number
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-text-muted mb-3">
                      Your location is used to notify you when infrastructure issues
                      are reported in your cell.
                    </p>
                    <LocationSelector
                      onChange={setLocation}
                      errors={fieldErrors}
                      clearError={clearError}
                    />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                    {loading ? 'Sending verification code…' : 'Continue →'}
                  </button>
                </form>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <p className="text-sm text-text-muted mb-4">
                      Enter the 6-digit code sent to{' '}
                      <strong>+250{phone.replace(/^\+250/, '').replace(/^0/, '')}</strong>
                    </p>
                    <label className="block text-sm font-medium text-text-main mb-1">
                      Verification Code <span className="text-danger">*</span>
                    </label>
                    <input type="text" value={otp} maxLength={6}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); clearError('otp'); }}
                      placeholder="000000"
                      className={`w-full font-mono text-center text-2xl tracking-widest ${inputClass(fieldErrors.otp)}`}
                    />
                    {fieldErrors.otp && <p className="text-danger text-xs mt-1">{fieldErrors.otp}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </button>

                  <div className="flex justify-between text-xs text-text-muted">
                    <button type="button"
                      onClick={() => { setStep(1); setOtp(''); setError(''); }}
                      className="hover:text-primary">
                      ← Edit details
                    </button>
                    <button type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="hover:text-primary disabled:opacity-50">
                      Resend code
                    </button>
                  </div>
                </form>
              )}

              {/* ── Step 3: PIN ── */}
              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <p className="text-sm text-text-muted mb-4">
                      Phone verified ✓ Now create a 4-digit PIN to log in quickly.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-1">
                        PIN <span className="text-danger">*</span>
                      </label>
                      <input type="password" value={pin} maxLength={4}
                        onChange={e => { setPin(e.target.value.replace(/\D/g,'')); clearError('pin'); }}
                        placeholder="••••"
                        className={`font-mono text-center text-xl tracking-widest ${inputClass(fieldErrors.pin)}`}
                      />
                      {fieldErrors.pin && <p className="text-danger text-xs mt-1">{fieldErrors.pin}</p>}
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
                      {fieldErrors.pinConfirm && <p className="text-danger text-xs mt-1">{fieldErrors.pinConfirm}</p>}
                    </div>
                  </div>

                  <p className="text-xs text-text-muted text-center">
                    By creating an account, you agree to our{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy &amp; Terms of Use</Link>.
                  </p>

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                    {loading ? 'Creating account…' : 'Create Account'}
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
                    onChange={e => { setLoginPhone(e.target.value.replace(/\D/g,'')); clearError('loginPhone'); }}
                    placeholder="7XXXXXXXX" maxLength={9}
                    className={`flex-1 ${inputClass(fieldErrors.loginPhone)}`}
                  />
                </div>
                {fieldErrors.loginPhone && <p className="text-danger text-xs mt-1">{fieldErrors.loginPhone}</p>}
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
                {fieldErrors.loginPin && <p className="text-danger text-xs mt-1">{fieldErrors.loginPin}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>
          )}
        </div>

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