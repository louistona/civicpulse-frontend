import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const STATUS_LABELS = {
  received: 'Received', under_review: 'Under Review',
  in_progress: 'In Progress', resolved: 'Resolved',
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingReportId, setDeletingReportId] = useState(null);
  const [reportError, setReportError] = useState('');

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [credential, setCredential] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    api.get('/reports/mine')
      .then(res => setMyReports(res.data))
      .catch(() => setReportError('Could not load your reports.'))
      .finally(() => setLoadingReports(false));
  }, [user, navigate]);

  if (!user) return null;

  const formatDate = iso => new Date(iso).toLocaleDateString('en-RW', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Delete this report permanently? This cannot be undone.')) return;
    setDeletingReportId(reportId);
    setReportError('');
    try {
      await api.delete(`/reports/${reportId}`);
      setMyReports(prev => prev.filter(r => r.report_id !== reportId));
    } catch (err) {
      setReportError(err.response?.data?.error || 'Could not delete this report.');
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setAccountError('');
    if (confirmText !== 'DELETE') {
      setAccountError('Please type DELETE in the box to confirm.');
      return;
    }
    setDeletingAccount(true);
    try {
      const body = user.role === 'official' ? { password: credential } : { pin: credential };
      await api.delete('/auth/me', { data: body });
      logout();
      navigate('/');
    } catch (err) {
      setAccountError(err.response?.data?.error || 'Could not delete your account.');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-main mb-1">My Account</h1>
      <p className="text-text-muted text-sm mb-6">
        Manage your account and the reports you've submitted.
      </p>

      {/* Account info */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-text-main mb-3 text-sm">Account details</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between">
            <dt className="text-text-muted">Name</dt>
            <dd className="text-text-main font-medium">{user.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Role</dt>
            <dd className="text-text-main font-medium capitalize">{user.role}</dd>
          </div>
          {user.phone && (
            <div className="flex justify-between">
              <dt className="text-text-muted">Phone</dt>
              <dd className="text-text-main font-medium">{user.phone}</dd>
            </div>
          )}
          {user.email && (
            <div className="flex justify-between">
              <dt className="text-text-muted">Email</dt>
              <dd className="text-text-main font-medium">{user.email}</dd>
            </div>
          )}
          {user.district_name && (
            <div className="flex justify-between">
              <dt className="text-text-muted">Location</dt>
              <dd className="text-text-main font-medium text-right">
                {[user.cell_name, user.sector_name, user.district_name].filter(Boolean).join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* My reports */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-text-main mb-1 text-sm">My reports</h2>
        <p className="text-text-muted text-xs mb-4">
          Reports you can delete are still marked "Received" — once an official has started
          responding, the report becomes part of the public accountability record and can no
          longer be removed.
        </p>

        {reportError && (
          <div className="bg-red-50 border border-red-200 text-danger text-xs rounded-lg px-3 py-2 mb-3">
            {reportError}
          </div>
        )}

        {loadingReports ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : myReports.length === 0 ? (
          <p className="text-text-muted text-sm">You haven't submitted any reports yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {myReports.map(r => (
              <li key={r.report_id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/reports/${r.report_id}`} className="text-sm font-medium text-text-main hover:text-primary truncate block">
                    {r.title}
                  </Link>
                  <p className="text-xs text-text-muted mt-0.5">
                    {SEVERITY_LABELS[r.severity]} · {r.category_name} · {STATUS_LABELS[r.status]} · {formatDate(r.created_at)}
                  </p>
                </div>
                {r.can_delete ? (
                  <button
                    onClick={() => handleDeleteReport(r.report_id)}
                    disabled={deletingReportId === r.report_id}
                    className="text-xs text-danger border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingReportId === r.report_id ? 'Deleting…' : 'Delete'}
                  </button>
                ) : (
                  <span className="text-xs text-text-muted flex-shrink-0">Can't be deleted</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="border-2 border-red-200 rounded-xl p-5">
        <h2 className="font-semibold text-danger mb-1 text-sm">Danger zone</h2>
        <p className="text-text-muted text-xs mb-4">
          Deleting your account is permanent. Your submitted reports will stay public (they're
          part of the public record) but will no longer be linked to your name. Your votes will
          be removed entirely.
        </p>

        {!showDeleteAccount ? (
          <button
            onClick={() => setShowDeleteAccount(true)}
            className="text-sm text-danger border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            {accountError && (
              <div className="bg-red-50 border border-red-200 text-danger text-xs rounded-lg px-3 py-2">
                {accountError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                {user.role === 'official' ? 'Confirm your password' : 'Confirm your 4-digit PIN'}
              </label>
              <input
                type="password"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                maxLength={user.role === 'official' ? undefined : 4}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main mb-1">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deletingAccount}
                className="bg-danger text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deletingAccount ? 'Deleting account…' : 'Permanently delete my account'}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteAccount(false); setAccountError(''); setCredential(''); setConfirmText(''); }}
                className="text-sm text-text-muted px-4 py-2 rounded-lg border border-border hover:text-text-main transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
