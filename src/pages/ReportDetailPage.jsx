import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import VotePanel from '../components/VotePanel';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const ALL_STATUSES = ['received', 'under_review', 'in_progress', 'resolved'];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-RW', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function ReportDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Official status update form state
  const [newStatus, setNewStatus]   = useState('');
  const [message, setMessage]       = useState('');
  const [updating, setUpdating]     = useState(false);
  const [updateMsg, setUpdateMsg]   = useState('');

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(res => {
        setReport(res.data);
        setNewStatus(res.data.status);
      })
      .catch(() => setError('Report not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.patch(`/reports/${id}/status`, { new_status: newStatus, message });
      // Refresh the report data
      const res = await api.get(`/reports/${id}`);
      setReport(res.data);
      setMessage('');
      setUpdateMsg('Status updated successfully.');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      setUpdateMsg(err.response?.data?.error || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger">{error}</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-text-muted hover:text-primary mb-6 flex items-center gap-1"
      >
        ← Back to map
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT: photo + description */}
        <div>
          {report.photo_url ? (
            <img
              src={report.photo_url}
              alt={report.title}
              className="w-full h-64 object-cover rounded-xl border border-border mb-4"
            />
          ) : (
            <div className="w-full h-64 bg-bg border border-border rounded-xl flex items-center justify-center text-text-muted mb-4">
              No photo submitted
            </div>
          )}

          <h1 className="text-xl font-bold text-text-main mb-2">{report.title}</h1>
          <p className="text-text-muted text-sm leading-relaxed">{report.description}</p>

          <div className="mt-4 bg-bg border border-border rounded-lg px-4 py-3">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-1">Coordinates</p>
            <p className="font-mono text-sm text-text-main">
              {report.latitude}, {report.longitude}
            </p>
          </div>
        </div>

        {/* RIGHT: metadata + timeline */}
        <div className="space-y-4">

          {/* Metadata card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            {[
              { label: 'Category',   value: report.category_name },
              { label: 'District',   value: report.district_name },
              { label: 'Submitted',  value: formatDate(report.created_at) },
              { label: 'Submitted by', value: report.submitted_by || 'Anonymous' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-text-muted">{label}</span>
                <span className="font-medium text-text-main text-right max-w-[60%]">{value}</span>
              </div>
            ))}

            <div className="flex justify-between text-sm items-center">
              <span className="text-text-muted">Severity</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full severity-${report.severity}`}>
                {SEVERITY_LABELS[report.severity]}
              </span>
            </div>

            <div className="flex justify-between text-sm items-center">
              <span className="text-text-muted">Status</span>
              <StatusBadge status={report.status} />
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="font-semibold text-text-main mb-4 text-sm">Status Timeline</h2>
            <div className="space-y-3">
              {ALL_STATUSES.map((s) => {
                const update = report.timeline?.find(t => t.new_status === s);
                const isPast = update != null;
                return (
                  <div key={s} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 border-2
                      ${isPast
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm capitalize font-medium ${isPast ? 'text-text-main' : 'text-text-muted'}`}>
                          {s.replace('_', ' ')}
                        </span>
                        {update && (
                          <span className="text-xs text-text-muted">{formatDate(update.created_at)}</span>
                        )}
                      </div>
                      {update?.message && (
                        <p className="text-xs text-text-muted mt-0.5 italic">"{update.message}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <VotePanel reportId={id} reportStatus={report.status} />
          </div>

          {/* Official update form */}
          {user?.role === 'official' && (
            <div className="bg-surface border border-primary/30 rounded-xl p-5">
              <h2 className="font-semibold text-text-main mb-4 text-sm">Update Status</h2>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Optional public message for the citizen..."
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60"
                >
                  {updating ? 'Saving…' : 'Save Update'}
                </button>
                {updateMsg && (
                  <p className={`text-xs text-center ${updateMsg.includes('success') ? 'text-primary' : 'text-danger'}`}>
                    {updateMsg}
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}