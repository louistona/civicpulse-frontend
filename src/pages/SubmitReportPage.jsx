import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PhotoUploader from '../components/PhotoUploader';
import PostSubmitAccountPrompt from '../components/PostSubmitAccountPrompt';

// Severity option definitions — label, description and selected border/bg colour
const SEVERITY_OPTIONS = [
  { value: 1, label: 'Low',      description: 'Minor inconvenience, no safety risk',      color: 'border-gray-300 bg-gray-50 text-gray-700'       },
  { value: 2, label: 'Medium',   description: 'Noticeable problem, limited impact',        color: 'border-amber-300 bg-amber-50 text-amber-700'    },
  { value: 3, label: 'High',     description: 'Significant disruption to daily life',      color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 4, label: 'Critical', description: 'Safety hazard or community access blocked', color: 'border-red-300 bg-red-50 text-red-700'          },
];

// Inner map component — listens for click events and drops a pin
function LocationPicker({ onLocationSelect, selectedLocation }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return selectedLocation
    ? <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
    : null;
}

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Form field state ──────────────────────────────────────────────────────
  const [title,            setTitle]            = useState('');
  const [description,      setDescription]      = useState('');
  const [categoryId,       setCategoryId]       = useState('');
  const [severity,         setSeverity]         = useState(null);
  const [mapLocation,      setMapLocation]      = useState(null); // { lat, lng }
  const [submitterName,    setSubmitterName]     = useState('');
  const [submitterContact, setSubmitterContact]  = useState('');
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [submittedReportId,  setSubmittedReportId]  = useState(null);

  // ── Location detection ────────────────────────────────────────────────────
  // UX CHANGE: district/sector/cell are no longer chosen from cascading
  // dropdowns. The citizen just drops a pin; the backend detects the
  // nearest cell (and its parent sector/district) from that pin — see
  // GET /reports/detect-location and services/geoDetection.js. This state
  // just holds a *preview* of that detection so the citizen has some
  // confirmation before submitting; the actual detection that decides
  // where notifications go happens again, authoritatively, server-side
  // inside POST /reports at submit time.
  const [detection, setDetection] = useState(null); // { detected, ...} | null
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (!mapLocation) { setDetection(null); return; }
    let cancelled = false;
    setDetecting(true);
    api.get('/reports/detect-location', { params: { lat: mapLocation.lat, lng: mapLocation.lng } })
      .then(res => { if (!cancelled) setDetection(res.data); })
      .catch(() => { if (!cancelled) setDetection({ detected: false, reason: 'lookup_failed' }); })
      .finally(() => { if (!cancelled) setDetecting(false); });
    return () => { cancelled = true; };
  }, [mapLocation]);

  // ── Photo upload state ────────────────────────────────────────────────────
  // photoUrl: the Cloudinary secure URL returned after a successful upload.
  //           null means no photo has been uploaded yet.
  // photoUploading: true while the XHR to Cloudinary is in flight.
  //                Used to disable the submit button during upload.
  const [photoUrl,       setPhotoUrl]       = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // ── Remote data ───────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const KIGALI_CENTER = [-1.9441, 30.0619];

  useEffect(() => {
    api.get('/reports/categories')
      .then(res => setCategories(res.data))
      .catch(() => setError('Could not load categories. Please refresh the page.'));
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!title.trim())         errors.title       = 'Title is required';
    if (!categoryId)           errors.categoryId  = 'Please select a category';
    if (!severity)             errors.severity    = 'Please select a severity level';
    // Photo is mandatory — citizens cannot submit without photographic evidence
    if (!photoUrl)             errors.photoUrl    = 'A photo is required — please upload one before submitting';
    if (!mapLocation)          errors.mapLocation = 'Please click on the map to pin the exact location';
    return errors;
  };

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const errors = validate();
  if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
  setSubmitting(true);
  try {
    const res = await api.post('/reports', {
      title:             title.trim(),
      description:       description.trim(),
      category_id:       parseInt(categoryId),
      severity,
      latitude:          mapLocation.lat,
      longitude:         mapLocation.lng,
      photo_url:         photoUrl,
      submitter_name:    user?.name || submitterName.trim() || 'Anonymous',
      submitter_contact: submitterContact.trim() || null,
    });

    const newReportId = res.data.report_id;
    setSubmittedReportId(newReportId);

    // If user is not logged in, show account creation prompt
    // If already logged in, navigate directly to the report
    if (!user) {
      setShowAccountPrompt(true);
    } else {
      navigate(`/reports/${newReportId}`);
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Submission failed. Please try again.');
  } finally {
    setSubmitting(false);
  }
  };

  // Clears a specific field error when the user interacts with that field
  const clearError = (field) =>
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-text-muted hover:text-primary mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-text-main mb-1">
        Report an Infrastructure Issue
      </h1>

      {/* FIX: this line previously always read "Signed in as {user?.name}",
          which showed "Signed in as ." for anonymous submitters now that
          this page no longer requires an account. */}
      <p className="text-text-muted text-sm mb-6">
        {user
          ? <>Signed in as <strong>{user.name}</strong>. Your report goes directly to the district office.</>
          : 'Reporting without an account. Your report is still fully public and goes directly to the district office.'}
      </p>

      {/* Global error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Issue Details ─────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-main">Issue Details</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); clearError('title'); }}
              placeholder="e.g. Large pothole blocking KG 11 Avenue"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary
                ${fieldErrors.title ? 'border-danger' : 'border-border'}`}
            />
            {fieldErrors.title && (
              <p className="text-danger text-xs mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Description{' '}
              <span className="text-text-muted font-normal">(optional but helpful)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem in detail — how long it has existed, who is affected, any safety hazards..."
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Category <span className="text-danger">*</span>
            </label>
            <select
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); clearError('categoryId'); }}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary
                ${fieldErrors.categoryId ? 'border-danger' : 'border-border'}`}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="text-danger text-xs mt-1">{fieldErrors.categoryId}</p>
            )}
          </div>
        </div>

        {/* ── Section 2: Optional Identity ────────────────────────────────── */}
        {/* Only shown when not logged in. Logged-in users already have their
            name attached to the account so this section is redundant for them. */}
        {!user && (
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-text-main">
                Your Details
                <span className="text-text-muted font-normal text-sm ml-2">(optional)</span>
              </h2>
              <p className="text-text-muted text-xs mt-1">
                Providing your contact allows officials to follow up directly with you.
                Leave blank to report anonymously.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={e => setSubmitterName(e.target.value)}
                  placeholder="e.g. Amina Uwase"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Phone or email
                </label>
                <input
                  type="text"
                  value={submitterContact}
                  onChange={e => setSubmitterContact(e.target.value)}
                  placeholder="e.g. 078xxxxxxx"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Section 3: Severity Level ────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-1">
            Severity Level <span className="text-danger">*</span>
          </h2>
          <p className="text-text-muted text-xs mb-4">
            Choose how serious this issue is. Community voting will verify and may
            adjust this after submission.
          </p>
          {fieldErrors.severity && (
            <p className="text-danger text-xs mb-3">{fieldErrors.severity}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEVERITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSeverity(opt.value); clearError('severity'); }}
                className={`text-left p-4 rounded-xl border-2 transition-all
                  ${severity === opt.value
                    ? opt.color + ' shadow-sm'
                    : 'border-border bg-bg hover:border-gray-300'}`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-80">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 4: Photo Evidence (required) ────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-1">
            Photo Evidence <span className="text-danger">*</span>
          </h2>
          <p className="text-text-muted text-xs mb-4">
            Take a clear photo showing the infrastructure problem. This will be publicly
            visible on your report as evidence for government officials.
          </p>
          <PhotoUploader
            label=""
            required={true}
            disabled={submitting}
            onUploadStart={() => {
              setPhotoUploading(true);
              clearError('photoUrl');
            }}
            onUploadComplete={(url) => {
              setPhotoUrl(url);
              setPhotoUploading(false);
              clearError('photoUrl');
            }}
          />
          {fieldErrors.photoUrl && (
            <p className="text-danger text-xs mt-2">{fieldErrors.photoUrl}</p>
          )}
        </div>

        {/* ── Section 5: Map Pin (exact location — also determines area) ──── */}
        {/* UX CHANGE: this section used to be paired with a separate
            "Administrative Location" section containing cascading
            district → sector → cell → village dropdowns. That's gone —
            dropping the pin here is now the ONLY location input. The
            backend detects the nearest cell from these coordinates (see
            GET /reports/detect-location, called below as a live preview,
            and re-run authoritatively inside POST /reports at submit
            time). */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-1">
            Location <span className="text-danger">*</span>
          </h2>
          <p className="text-text-muted text-xs mb-3">
            Click the map to drop a pin at the exact location of the issue. Zoom in
            for a more precise placement. Click again to move the pin. We'll
            automatically detect which cell it's in.
          </p>

          {fieldErrors.mapLocation && (
            <p className="text-danger text-xs mb-3">{fieldErrors.mapLocation}</p>
          )}

          {/* Coordinate display — green when pin has been placed */}
          <div className={`mb-2 text-xs px-3 py-2 rounded-lg font-medium
            ${mapLocation
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-bg border border-border text-text-muted'}`}
          >
            {mapLocation
              ? `📍 ${mapLocation.lat.toFixed(5)}, ${mapLocation.lng.toFixed(5)}`
              : '📍 No location selected — click the map below'}
          </div>

          {/* Live detected-area feedback */}
          {mapLocation && (
            <div className={`mb-3 text-xs px-3 py-2 rounded-lg font-medium
              ${detecting
                ? 'bg-bg border border-border text-text-muted'
                : detection?.detected
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'}`}
            >
              {detecting
                ? 'Detecting area…'
                : detection?.detected
                  ? `🎯 Detected: ${detection.cell_name} Cell, ${detection.sector_name} Sector, ${detection.district_name} (${detection.distance_km} km from cell centre)`
                  : detection?.reason === 'no_centroids_seeded'
                    ? '⚠️ Area detection isn\u2019t set up yet — your report will still be submitted, but nearby residents won\u2019t get an SMS about it.'
                    : '⚠️ Could not confidently detect an area for this pin — your report will still be submitted, but nearby residents may not be notified by SMS.'}
            </div>
          )}

          {/* Map — red border when validation fails, normal border otherwise */}
          <div className={`rounded-xl overflow-hidden border-2
            ${fieldErrors.mapLocation ? 'border-danger' : 'border-border'}`}
          >
            <MapContainer
              center={KIGALI_CENTER}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                onLocationSelect={loc => {
                  setMapLocation(loc);
                  clearError('mapLocation');
                }}
                selectedLocation={mapLocation}
              />
            </MapContainer>
          </div>
        </div>

        {/* ── Submit / Cancel buttons ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            // Disabled while a photo upload is in flight or while the API call is running
            disabled={submitting || photoUploading}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dk transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {photoUploading ? 'Uploading photo…'
              : submitting   ? 'Submitting report…'
              : 'Submit Report'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-border rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-text-muted text-center pb-4">
          Your report and photo will be publicly visible on the heatmap and report
          board. Do not include personal information in the description or photo.
        </p>

      </form>
      {showAccountPrompt && (
        <PostSubmitAccountPrompt
          reportId={submittedReportId}
          onDismiss={() => navigate(`/reports/${submittedReportId}`)}
        />
      )}
    </div>
  );
}
