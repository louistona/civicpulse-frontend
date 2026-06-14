import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Severity options with labels and colors
const SEVERITY_OPTIONS = [
  { value: 1, label: 'Low',      description: 'Minor inconvenience, no safety risk',      color: 'border-gray-300 bg-gray-50 text-gray-700'   },
  { value: 2, label: 'Medium',   description: 'Noticeable problem, limited impact',        color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { value: 3, label: 'High',     description: 'Significant disruption to daily life',      color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 4, label: 'Critical', description: 'Safety hazard or community access blocked', color: 'border-red-300 bg-red-50 text-red-700'       },
];

// This inner component listens for map clicks and updates the selected location
function LocationPicker({ onLocationSelect, selectedLocation }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
  ) : null;
}

export default function SubmitReportPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  // Form field state
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [categoryId,  setCategoryId]  = useState('');
  const [districtId,  setDistrictId]  = useState('');
  const [severity,    setSeverity]    = useState(null);
  const [location,    setLocation]    = useState(null); // { lat, lng }

  // Data loaded from API
  const [categories,  setCategories]  = useState([]);
  const [districts,   setDistricts]   = useState([]);

  // UI state
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Kigali center for the map
  const KIGALI_CENTER = [-1.9441, 30.0619];

  // Load categories and districts when the page opens
  useEffect(() => {
    Promise.all([
      api.get('/reports/categories'),
      api.get('/reports/districts'),
    ]).then(([catRes, distRes]) => {
      setCategories(catRes.data);
      setDistricts(distRes.data);
    }).catch(() => {
      setError('Could not load form data. Please refresh the page.');
    });
  }, []);

  // Redirect if not a citizen
  useEffect(() => {
    if (user && user.role !== 'citizen') {
      navigate('/');
    }
  }, [user, navigate]);

  // Validate all fields before submitting
  const validate = () => {
    const errors = {};
    if (!title.trim())       errors.title       = 'Title is required';
    if (title.length > 255)  errors.title       = 'Title must be under 255 characters';
    if (!categoryId)         errors.categoryId  = 'Please select a category';
    if (!districtId)         errors.districtId  = 'Please select a district';
    if (!severity)           errors.severity    = 'Please select a severity level';
    if (!location)           errors.location    = 'Please click on the map to select a location';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Run validation
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/reports', {
        title:       title.trim(),
        description: description.trim(),
        category_id: parseInt(categoryId),
        district_id: parseInt(districtId),
        severity:    severity,
        latitude:    location.lat,
        longitude:   location.lng,
      });

      // Success — go to the new report's detail page
      navigate(`/reports/${response.data.report_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clear a field error when user interacts with that field
  const clearError = (field) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-text-muted hover:text-primary mb-3 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-text-main">Submit Infrastructure Report</h1>
        <p className="text-text-muted text-sm mt-1">
          Report a problem in your community. Your report goes directly to the relevant district office.
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── SECTION 1: Basic Info ── */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-main text-base">Issue Details</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); clearError('title'); }}
              placeholder="e.g. Large pothole blocking lane on KG 11 Ave"
              maxLength={255}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary
                ${fieldErrors.title ? 'border-danger' : 'border-border'}`}
            />
            {fieldErrors.title && (
              <p className="text-danger text-xs mt-1">{fieldErrors.title}</p>
            )}
            <p className="text-text-muted text-xs mt-1">{title.length}/255 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Description <span className="text-text-muted font-normal">(optional but helpful)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem in detail. Include any relevant context such as how long the issue has existed, how it affects daily life, or any safety hazards."
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category and District — side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p className="text-danger text-xs mt-1">{fieldErrors.categoryId}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                District <span className="text-danger">*</span>
              </label>
              <select
                value={districtId}
                onChange={e => { setDistrictId(e.target.value); clearError('districtId'); }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary
                  ${fieldErrors.districtId ? 'border-danger' : 'border-border'}`}
              >
                <option value="">Select a district</option>
                {districts.map(d => (
                  <option key={d.district_id} value={d.district_id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {fieldErrors.districtId && (
                <p className="text-danger text-xs mt-1">{fieldErrors.districtId}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Severity ── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main text-base mb-1">Severity Level</h2>
          <p className="text-text-muted text-xs mb-4">
            Choose how serious this issue is. This affects how it is prioritized on the heatmap.
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
                    ? opt.color + ' border-opacity-100 shadow-sm'
                    : 'border-border bg-bg hover:border-gray-300'
                  }`}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-80">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: Location ── */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main text-base mb-1">Location</h2>
          <p className="text-text-muted text-xs mb-4">
            Click anywhere on the map to drop a pin at the exact location of the issue.
          </p>

          {fieldErrors.location && (
            <p className="text-danger text-xs mb-3">{fieldErrors.location}</p>
          )}

          {/* Location status */}
          <div className={`text-xs px-3 py-2 rounded-lg mb-3 font-medium
            ${location
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-bg border border-border text-text-muted'
            }`}
          >
            {location
              ? `📍 Location selected: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : '📍 No location selected yet — click the map below'
            }
          </div>

          {/* Map */}
          <div className={`rounded-xl overflow-hidden border-2 transition-colors
            ${fieldErrors.location ? 'border-danger' : 'border-border'}`}
          >
            <MapContainer
              center={KIGALI_CENTER}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '320px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                onLocationSelect={(loc) => { setLocation(loc); clearError('location'); }}
                selectedLocation={location}
              />
            </MapContainer>
          </div>

          <p className="text-text-muted text-xs mt-2">
            Zoom in for a more precise location. Click again to move the pin.
          </p>
        </div>

        {/* ── Submit button ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dk transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? 'Submitting report…' : 'Submit Report'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-border rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-text-muted text-center">
          Your report will be publicly visible on the heatmap. Do not include personal information in the description.
        </p>

      </form>
    </div>
  );
}