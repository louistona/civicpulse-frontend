import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

const SEVERITY_OPTIONS = [
  { value: 1, label: 'Low',      description: 'Minor inconvenience, no safety risk',       color: 'border-gray-300 bg-gray-50 text-gray-700'      },
  { value: 2, label: 'Medium',   description: 'Noticeable problem, limited impact',         color: 'border-amber-300 bg-amber-50 text-amber-700'   },
  { value: 3, label: 'High',     description: 'Significant disruption to daily life',       color: 'border-orange-300 bg-orange-50 text-orange-700'},
  { value: 4, label: 'Critical', description: 'Safety hazard or community access blocked',  color: 'border-red-300 bg-red-50 text-red-700'         },
];

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

  const [title,           setTitle]           = useState('');
  const [description,     setDescription]     = useState('');
  const [categoryId,      setCategoryId]      = useState('');
  const [districtId,      setDistrictId]      = useState('');
  const [severity,        setSeverity]        = useState(null);
  const [location,        setLocation]        = useState(null);
  const [submitterName,   setSubmitterName]   = useState('');
  const [submitterContact,setSubmitterContact]= useState('');
  const [categories,      setCategories]      = useState([]);
  const [districts,       setDistricts]       = useState([]);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState('');
  const [fieldErrors,     setFieldErrors]     = useState({});

  const KIGALI_CENTER = [-1.9441, 30.0619];

  useEffect(() => {
    Promise.all([
      api.get('/reports/categories'),
      api.get('/reports/districts'),
    ]).then(([catRes, distRes]) => {
      setCategories(catRes.data);
      setDistricts(distRes.data);
    }).catch(() => setError('Could not load form options. Please refresh.'));
  }, []);

  const validate = () => {
    const errors = {};
    if (!title.trim())      errors.title      = 'Title is required';
    if (!categoryId)        errors.categoryId = 'Please select a category';
    if (!districtId)        errors.districtId = 'Please select a district';
    if (!severity)          errors.severity   = 'Please select a severity level';
    if (!location)          errors.location   = 'Please click on the map to pin the location';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/reports', {
        title:            title.trim(),
        description:      description.trim(),
        category_id:      parseInt(categoryId),
        district_id:      parseInt(districtId),
        severity,
        latitude:         location.lat,
        longitude:        location.lng,
        submitter_name:   submitterName.trim() || 'Anonymous',
        submitter_contact:submitterContact.trim() || null,
      });
      navigate(`/reports/${res.data.report_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearError = (field) =>
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)}
        className="text-sm text-text-muted hover:text-primary mb-4 flex items-center gap-1">
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-text-main mb-1">Report an Infrastructure Issue</h1>
      <p className="text-text-muted text-sm mb-6">
        No account needed. Your report goes directly to the district office.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Issue Details */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-main">Issue Details</h2>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Title <span className="text-danger">*</span>
            </label>
            <input type="text" value={title}
              onChange={e => { setTitle(e.target.value); clearError('title'); }}
              placeholder="e.g. Large pothole blocking KG 11 Avenue"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.title ? 'border-danger' : 'border-border'}`}
            />
            {fieldErrors.title && <p className="text-danger text-xs mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem in detail..."
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Category <span className="text-danger">*</span>
              </label>
              <select value={categoryId}
                onChange={e => { setCategoryId(e.target.value); clearError('categoryId'); }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.categoryId ? 'border-danger' : 'border-border'}`}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>{c.name}</option>
                ))}
              </select>
              {fieldErrors.categoryId && <p className="text-danger text-xs mt-1">{fieldErrors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                District <span className="text-danger">*</span>
              </label>
              <select value={districtId}
                onChange={e => { setDistrictId(e.target.value); clearError('districtId'); }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.districtId ? 'border-danger' : 'border-border'}`}>
                <option value="">Select district</option>
                {districts.map(d => (
                  <option key={d.district_id} value={d.district_id}>{d.name}</option>
                ))}
              </select>
              {fieldErrors.districtId && <p className="text-danger text-xs mt-1">{fieldErrors.districtId}</p>}
            </div>
          </div>
        </div>

        {/* Optional Identity */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-text-main">Your Details
              <span className="text-text-muted font-normal text-sm ml-2">(optional)</span>
            </h2>
            <p className="text-text-muted text-xs mt-1">
              Providing your contact allows officials to follow up. Leave blank to report anonymously.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Your name</label>
              <input type="text" value={submitterName}
                onChange={e => setSubmitterName(e.target.value)}
                placeholder="e.g. Amina Uwase"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Phone or email</label>
              <input type="text" value={submitterContact}
                onChange={e => setSubmitterContact(e.target.value)}
                placeholder="e.g. 078xxxxxxx"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-3">Severity Level <span className="text-danger">*</span></h2>
          {fieldErrors.severity && <p className="text-danger text-xs mb-3">{fieldErrors.severity}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEVERITY_OPTIONS.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { setSeverity(opt.value); clearError('severity'); }}
                className={`text-left p-4 rounded-xl border-2 transition-all
                  ${severity === opt.value ? opt.color + ' shadow-sm' : 'border-border bg-bg hover:border-gray-300'}`}>
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-80">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-main mb-1">Location <span className="text-danger">*</span></h2>
          <p className="text-text-muted text-xs mb-3">Click the map to pin the exact location of the issue.</p>
          {fieldErrors.location && <p className="text-danger text-xs mb-3">{fieldErrors.location}</p>}
          <div className={`mb-3 text-xs px-3 py-2 rounded-lg font-medium
            ${location ? 'bg-green-50 border border-green-200 text-green-700'
                       : 'bg-bg border border-border text-text-muted'}`}>
            {location
              ? `📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : '📍 No location selected — click the map'}
          </div>
          <div className={`rounded-xl overflow-hidden border-2 ${fieldErrors.location ? 'border-danger' : 'border-border'}`}>
            <MapContainer center={KIGALI_CENTER} zoom={13}
              style={{ height: '300px', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                onLocationSelect={loc => { setLocation(loc); clearError('location'); }}
                selectedLocation={location}
              />
            </MapContainer>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={submitting}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dk transition-colors disabled:opacity-60 text-sm">
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-3 border border-border rounded-xl text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}