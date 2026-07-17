import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';
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

  // ── Administrative location — managed by LocationSelector ─────────────────
  // Captures district_id, sector_id, cell_id and village from the cascading
  // dropdowns. All three IDs are sent to the API so SMS notifications (cell)
  // and email notifications (sector) fire correctly.
  const [location, setLocation] = useState({
    district_id: '', sector_id: '', cell_id: '', village: '',
  });

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

  // Load categories on mount — districts/sectors/cells loaded by LocationSelector
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
    if (!location.district_id) errors.district_id = 'Please select a district';
    if (!location.sector_id)   errors.sector_id   = 'Please select a sector';
    if (!location.cell_id)     errors.cell_id     = 'Please select a cell';
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
      district_id:       parseInt(location.district_id),
      sector_id:         parseInt(location.sector_id),
      cell_id:           parseInt(location.cell_id),
      village:           location.village || null,
      severity,
      latitude:          mapLocation.lat,
      longitude:         mapLocation.lng,
      submitter_name:    user?.name || submitterName.trim() || 'Anonymous',
      submitter_contact: submitterContact.trim() || null,
    });

    const newReportId = res.data.report_id;

    if (photoUrl) {
      await api.post(`/photos/${newReportId}/submission`, {
        photo_url: photoUrl,
        caption:   title.trim(),
      });
    }

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

      {/* Signed-in user greeting — replaces the old misleading "No account needed" text */}
      <p className="text-text-muted text-sm mb-6">
        Signed in as <strong>{user?.name}</strong>. Your report goes directly to the district office.
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

        {/* ── Section 2: Administrative Location ──────────────────────────── */}
        {/* LocationSelector handles the cascading district → sector → cell → village
            dropdowns. It captures all three IDs needed for notifications to work:
            - cell_id   → used to find users in the same cell for SMS vote notifications
            - sector_id → used to find officials in the same sector for email alerts */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-1">Administrative Location</h2>
          <p className="text-text-muted text-xs mb-4">
            Select where the issue is located. This determines which officials are
            notified and which community members receive a vote request by SMS.
          </p>
          <LocationSelector
            onChange={(loc) => {
              setLocation(loc);
              clearError('district_id');
              clearError('sector_id');
              clearError('cell_id');
            }}
            errors={fieldErrors}
            clearError={clearError}
          />
        </div>

        {/* ── Section 3: Optional Identity ────────────────────────────────── */}
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

        {/* ── Section 4: Severity Level ────────────────────────────────────── */}
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

        {/* ── Section 5: Photo Evidence (required) ────────────────────────── */}
        {/* Photo is mandatory — validate() blocks submission if photoUrl is null.
            Upload flow:
              1. User drags/drops or clicks to select an image file
              2. PhotoUploader sends the file directly to Cloudinary via XHR
              3. Cloudinary returns a secure_url
              4. onUploadComplete sets photoUrl with that URL
              5. On form submit, the URL is POSTed to /api/photos/:id/submission
                 which inserts a row into report_photos and sets has_submission_photo=TRUE */}
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

        {/* ── Section 6: Map Pin (exact location) ─────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-1">
            Exact Location <span className="text-danger">*</span>
          </h2>
          <p className="text-text-muted text-xs mb-3">
            Click the map to drop a pin at the exact location of the issue. Zoom in
            for a more precise placement. Click again to move the pin.
          </p>

          {fieldErrors.mapLocation && (
            <p className="text-danger text-xs mb-3">{fieldErrors.mapLocation}</p>
          )}

          {/* Coordinate display — green when pin has been placed */}
          <div className={`mb-3 text-xs px-3 py-2 rounded-lg font-medium
            ${mapLocation
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-bg border border-border text-text-muted'}`}
          >
            {mapLocation
              ? `📍 ${mapLocation.lat.toFixed(5)}, ${mapLocation.lng.toFixed(5)}`
              : '📍 No location selected — click the map below'}
          </div>

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