import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthPage() {
  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'citizen',
  });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(''); // clear error on any change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload  = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);

      // Role-based redirect
      navigate(res.data.user.role === 'official' ? '/' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-main tracking-tight">CivicPulse</h1>
          <p className="text-text-muted mt-1 text-sm">
            Report infrastructure issues. Hold officials accountable.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">

          {/* Tab switcher */}
          <div className="flex bg-bg rounded-lg p-1 mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all capitalize
                  ${mode === m
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-text-muted hover:text-text-main'
                  }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Amina Uwase"
                  required
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={mode === 'signup' ? 'Minimum 8 characters' : '••••••••'}
                required
                minLength={mode === 'signup' ? 8 : undefined}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Role selector signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  I am signing up as
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                >
                  <option value="citizen">A Citizen</option>
                  <option value="official">A Government Official</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  Official accounts require verification before dashboard access.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Log In' : 'Create Account'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          By signing up you agree to CivicPulse's terms of service.
        </p>
      </div>
    </div>
  );
}