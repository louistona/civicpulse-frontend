import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';

export default function OfficialAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');

  // Login fields
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Signup fields
  const [name,       setName]       = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPass,    setRegPass]    = useState('');
  const [department, setDepartment] = useState('');
  const [location,   setLocation]   = useState({
    district_id: '', sector_id: '', cell_id: '', village: ''
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError = (field) => setFieldErrors(p => ({ ...p, [field]: '' }));

  const inputClass = (hasError) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary
    ${hasError ? 'border-danger' : 'border-border'}`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/official/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim())        errors.name       = 'Name is required';
    if (!regEmail)           errors.regEmail   = 'Email is required';
    if (!regPass || regPass.length < 8) errors.regPass = 'Password must be at least 8 characters';
    if (!department.trim())  errors.department = 'Department is required';
    if (!location.district_id) errors.district_id = 'District is required';
    if (!location.sector_id)   errors.sector_id   = 'Sector is required';
    if (!location.cell_id)     errors.cell_id     = 'Cell is required';

    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/official/register', {
        name: name.trim(), email: regEmail, password: regPass,
        department: department.trim(),
        district_id: location.district_id,
        sector_id:   location.sector_id,
        cell_id:     location.cell_id,
        village:     location.village || '',
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-primary">CivicPulse</Link>
          <p className="text-text-muted text-sm mt-1">Government Official Portal</p>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full mt-2">
            <span>🏛️</span> Official accounts only
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">

          <div className="flex bg-bg rounded-lg p-1 mb-6">
            {[['login','Log In'],['signup','Register']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
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

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="official@gov.rw"
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Password <span className="text-danger">*</span>
                </label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass(false)}
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input type="text" value={name}
                  onChange={e => { setName(e.target.value); clearError('name'); }}
                  placeholder="e.g. Jean Pierre Habimana"
                  className={inputClass(fieldErrors.name)}
                />
                {fieldErrors.name && <p className="text-danger text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input type="email" value={regEmail}
                  onChange={e => { setRegEmail(e.target.value); clearError('regEmail'); }}
                  placeholder="official@gov.rw"
                  className={inputClass(fieldErrors.regEmail)}
                />
                {fieldErrors.regEmail && <p className="text-danger text-xs mt-1">{fieldErrors.regEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Password <span className="text-danger">*</span>
                </label>
                <input type="password" value={regPass}
                  onChange={e => { setRegPass(e.target.value); clearError('regPass'); }}
                  placeholder="Minimum 8 characters"
                  className={inputClass(fieldErrors.regPass)}
                />
                {fieldErrors.regPass && <p className="text-danger text-xs mt-1">{fieldErrors.regPass}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Department <span className="text-danger">*</span>
                </label>
                <input type="text" value={department}
                  onChange={e => { setDepartment(e.target.value); clearError('department'); }}
                  placeholder="e.g. Roads & Infrastructure"
                  className={inputClass(fieldErrors.department)}
                />
                {fieldErrors.department && <p className="text-danger text-xs mt-1">{fieldErrors.department}</p>}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-text-muted mb-4">
                  Your location determines which sector reports you receive email notifications for.
                </p>
                <LocationSelector
                  onChange={setLocation}
                  errors={fieldErrors}
                  clearError={clearError}
                />
              </div>

              <p className="text-xs text-text-muted text-center">
                By creating an account, you agree to our{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy &amp; Terms of Use</Link>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60">
                {loading ? 'Creating account…' : 'Create Official Account'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          Citizen?{' '}
          <Link to="/auth/citizen" className="text-primary hover:underline font-medium">
            Citizen portal →
          </Link>
        </p>
      </div>
    </div>
  );
}