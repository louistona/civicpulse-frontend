import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import VotePanel from '../components/VotePanel';
import ReportPhotos from '../components/ReportPhotos';
import PhotoUploader from '../components/PhotoUploader';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const SEVERITY_COLORS = {
  1: 'bg-gray-100 text-gray-600',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};
const ALL_STATUSES = ['received', 'under_review', 'in_progress', 'resolved'];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-RW', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function ReportDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Report data ───────────────────────────────────────────────────────────
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // ── Official status update form ───────────────────────────────────────────
  const [newStatus,  setNewStatus]  = useState('');
  const [message,    setMessage]    = useState('');
  const [updating,   setUpdating]   = useState(false);
  const [updateMsg,  setUpdateMsg]  = useState('');

  // ── Resolution photo state ────────────────────────────────────────────────
  // resolutionPhotoUrl: the Cloudinary URL of the photo uploaded by the official
  //   when marking a report as resolved. null until the official uploads one.
  // resolutionPhotoUploading: true while the Cloudinary XHR is in flight.
  //   Disables the Save Update button to prevent submitting before upload finishes.
  const [resolutionPhotoUrl,       setResolutionPhotoUrl]       = useState(null);
  const [resolutionPhotoUploading, setResolutionPhotoUploading] = useState(false);

  // Fetch the report (with photos and timeline) whenever the ID changes
  const fetchReport = () => {
    api.get(`/reports/${id}`)
      .then(res => {
        setReport(res.data);
        setNewStatus(res.data.status);
      })
      .catch(() => setError('Report not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [id]);

  // ── Status update handler ─────────────────────────────────────────────────
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Step 1 — update the report status and get the new status_update row's ID
      const statusRes = await api.patch(`/reports/${id}/status`, {
        new_status: newStatus,
        message,
      });

      const newUpdateId = statusRes.data.update_id;

      // Step 2 — if the status is being set to resolved and the official
      // uploaded a resolution photo, save it and link it to this status update.
      // The photo was already uploaded to Cloudinary during the upload step —
      // this call only saves the URL reference and links it to the timeline entry.
      if (newStatus === 'resolved' && resolutionPhotoUrl) {
        await api.post(`/photos/${id}/resolution`, {
          photo_url:        resolutionPhotoUrl,
          caption:          `Resolution confirmed — ${new Date().toLocaleDateString('en-RW', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}`,
          status_update_id: newUpdateId,
        });
      }

      // Step 3 — re-fetch the full report so photos, timeline and status
      // badge all update in one operation without a page reload
      const res = await api.get(`/reports/${id}`);
      setReport(res.data);
      setNewStatus(res.data.status);
      setMessage('');
      setResolutionPhotoUrl(null);
      setUpdateMsg('Status updated successfully.');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      setUpdateMsg(err.response?.data?.error || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading and error states ──────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger">
      {error}
    </div>
  );

  // active_severity is aliased as severity by the API — this covers both the
  // community-voted severity and the citizen's initial severity automatically
  const displaySeverity = report.severity
    || report.active_severity
    || report.initial_severity;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-text-muted hover:text-primary mb-6 flex items-center gap-1"
      >
        ← Back to map
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── LEFT COLUMN: photos + title + description + coordinates ──────── */}
        <div>

          {/* ReportPhotos renders two clearly labelled sections:
                "Reported Condition"  — submission photos (the problem evidence)
                "Resolution Evidence" — resolution photos (proof of fix)
              Each photo is clickable and opens a full-screen lightbox.
              If there are no photos at all, a placeholder message is shown.
              If the report is resolved and has both photo types, a green
              "before and after" confirmation banner appears at the bottom. */}
          <ReportPhotos
            photos={report.photos}
            reportStatus={report.status}
          />

          {/* Report title and description — below the photos */}
          <h1 className="text-xl font-bold text-text-main mt-4 mb-2">
            {report.title}
          </h1>
          <p className="text-text-muted text-sm leading-relaxed">
            {report.description}
          </p>

          {/* Coordinates */}
          <div className="mt-4 bg-bg border border-border rounded-lg px-4 py-3">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-1">
              Coordinates
            </p>
            <p className="font-mono text-sm text-text-main">
              {report.latitude}, {report.longitude}
            </p>
          </div>

          {/* Severity source indicator — shows whether severity is community-verified */}
          {report.severity_source && (
            <div className={`mt-3 text-xs px-3 py-2 rounded-lg inline-flex items-center gap-1.5
              ${report.severity_source === 'community'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-amber-50 border border-amber-200 text-amber-700'}`}
            >
              {report.severity_source === 'community'
                ? '🗳️ Severity confirmed by community vote'
                : '⚠️ Awaiting community vote to verify severity'}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: metadata + timeline + vote panel + official form ── */}
        <div className="space-y-4">

          {/* Metadata card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            {[
              { label: 'Category',     value: report.category_name },
              { label: 'District',     value: report.district_name },
              { label: 'Sector',       value: report.sector_name   },
              { label: 'Cell',         value: report.cell_name     },
              { label: 'Submitted',    value: formatDate(report.created_at) },
              { label: 'Submitted by', value: report.submitted_by || report.submitter_name || 'Anonymous' },
            ].filter(item => item.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-text-muted">{label}</span>
                <span className="font-medium text-text-main text-right max-w-[60%]">
                  {value}
                </span>
              </div>
            ))}

            {/* Severity badge */}
            <div className="flex justify-between text-sm items-center">
              <span className="text-text-muted">Severity</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                ${SEVERITY_COLORS[displaySeverity]}`}>
                {SEVERITY_LABELS[displaySeverity]}
              </span>
            </div>

            {/* Status badge */}
            <div className="flex justify-between text-sm items-center">
              <span className="text-text-muted">Status</span>
              <StatusBadge status={report.status} />
            </div>

            {/* Vote quick summary — shown once any votes exist */}
            {report.vote_total > 0 && (
              <div className="flex justify-between text-sm items-center pt-1 border-t border-border">
                <span className="text-text-muted">Community votes</span>
                <span className="text-xs text-text-muted font-medium">
                  👍 {report.vote_upvotes} · 👎 {report.vote_downvotes} · 🤷 {report.vote_abstentions}
                </span>
              </div>
            )}
          </div>

          {/* Status timeline card */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="font-semibold text-text-main mb-4 text-sm">Status Timeline</h2>
            <div className="space-y-3">
              {ALL_STATUSES.map((s) => {
                const update = report.timeline?.find(t => t.new_status === s);
                const isPast = update != null;
                return (
                  <div key={s} className="flex items-start gap-3">
                    {/* Timeline dot — filled green for past statuses */}
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 border-2
                      ${isPast
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'}`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm capitalize font-medium
                          ${isPast ? 'text-text-main' : 'text-text-muted'}`}>
                          {s.replace(/_/g, ' ')}
                        </span>
                        {update && (
                          <span className="text-xs text-text-muted">
                            {formatDate(update.created_at)}
                          </span>
                        )}
                      </div>

                      {/* Official message for this timeline entry */}
                      {update?.message && (
                        <p className="text-xs text-text-muted mt-0.5 italic">
                          "{update.message}"
                        </p>
                      )}

                      {/* Official name */}
                      {update?.official_name && (
                        <p className="text-xs text-text-muted mt-0.5">
                          by {update.official_name}
                        </p>
                      )}

                      {/* Resolution photo thumbnail inline in the timeline entry */}
                      {update?.resolution_photo_url && (
                        <div className="mt-2">
                          <a
                            href={update.resolution_photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={update.resolution_photo_url}
                              alt={update.resolution_photo_caption || 'Resolution photo'}
                              className="w-full h-24 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity"
                            />
                            <p className="text-xs text-primary mt-1 hover:underline">
                              📷 View resolution photo
                            </p>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community vote panel — sits as its own card OUTSIDE the timeline.
              Previously it was nested inside the timeline's closing </div> which
              caused it to render as a child element of the timeline panel with
              no visual separation. It is now a proper sibling card. */}
          <VotePanel reportId={id} reportStatus={report.status} />

          {/* Official status update form — only visible to government officials */}
          {user?.role === 'official' && (
            <div className="bg-surface border border-primary/30 rounded-xl p-5">
              <h2 className="font-semibold text-text-main mb-4 text-sm">Update Status</h2>
              <form onSubmit={handleStatusUpdate} className="space-y-3">

                {/* Status dropdown */}
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>

                {/* Public message textarea */}
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Optional public message visible to the citizen who submitted this report..."
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {/* Resolution photo upload section — only shown when the official
                    selects "resolved" from the dropdown. Uploading a photo is
                    optional but strongly encouraged as proof of resolution.
                    Upload flow mirrors the citizen submission flow:
                      1. Official selects/drops a photo file
                      2. PhotoUploader sends it directly to Cloudinary
                      3. onUploadComplete sets resolutionPhotoUrl with the URL
                      4. On Save Update, the URL is POSTed to /api/photos/:id/resolution
                         which inserts into report_photos and links to the status update row */}
                {newStatus === 'resolved' && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-xs font-medium text-text-main">
                      📷 Resolution Photo
                      <span className="text-text-muted font-normal ml-1">
                        — upload proof that the issue has been fixed (optional but recommended)
                      </span>
                    </p>
                    <PhotoUploader
                      label=""
                      required={false}
                      disabled={updating}
                      onUploadStart={() => setResolutionPhotoUploading(true)}
                      onUploadComplete={(url) => {
                        setResolutionPhotoUrl(url);
                        setResolutionPhotoUploading(false);
                      }}
                    />
                  </div>
                )}

                {/* Save button — disabled while photo uploading or API call running */}
                <button
                  type="submit"
                  disabled={updating || resolutionPhotoUploading}
                  className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-dk transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resolutionPhotoUploading ? 'Uploading photo…'
                    : updating ? 'Saving…'
                    : 'Save Update'}
                </button>

                {/* Success or error feedback */}
                {updateMsg && (
                  <p className={`text-xs text-center
                    ${updateMsg.includes('success') ? 'text-primary' : 'text-danger'}`}>
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