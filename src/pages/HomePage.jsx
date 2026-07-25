import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import api from '../services/api';
import ReportCard from '../components/ReportCard';
// eslint-disable-next-line no-unused-vars
import StatusBadge from '../components/StatusBadge';
import ReportLoginModal from '../components/ReportLoginModal';
import Pagination from '../components/Pagination';
import usePaginatedReports from '../hooks/usePaginatedReports';
import { useAuth } from '../context/AuthContext';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const SEVERITY_COLORS = { 1: '#6B7280', 2: '#E89B2F', 3: '#F97316', 4: '#D9534F' };

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const heat = L.heatLayer(points, {
      radius: 35, blur: 25, maxZoom: 17,
      gradient: { 0.2: '#1A7A4A', 0.5: '#E89B2F', 0.8: '#F97316', 1.0: '#D9534F' },
    });
    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [points, map]);
  return null;
}

export default function HomePage() {
  // UX FIX: the map's pins previously came from the same `reports` array
  // as the paginated card grid below it, meaning paginating the grid would
  // have silently hidden pins for reports that are still active — a
  // report on "page 2" of the list would vanish from the map entirely.
  // The map now fetches ALL active reports (lightweight fields only) from
  // the new, unpaginated GET /reports/map endpoint, completely decoupled
  // from the card grid's pagination below.
  const [mapReports, setMapReports] = useState([]);
  const [mapLoading,  setMapLoading] = useState(true);
  const [heatPoints, setHeat]       = useState([]);
  const [severity,   setSeverity]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const KIGALI_CENTER = [-1.9441, 30.0619];

  // Card grid below the map — paginated, respects the severity filter.
  const {
    reports, loading, pagination,
    page, setPage, limit, setLimit,
  } = usePaginatedReports(severity ? { severity } : {}, 12);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [mapRes, heatRes] = await Promise.all([
          api.get('/reports/map'),
          api.get('/heatmap'),
        ]);
        setMapReports(mapRes.data);
        setHeat(heatRes.data.points);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setMapLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const visibleMapReports = severity
    ? mapReports.filter(r => String(r.severity) === severity)
    : mapReports;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Infrastructure Reports</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Kigali City · Click any point on the map to see report details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={severity}
            onChange={e => setSeverity(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All severities</option>
            <option value="4">Critical</option>
            <option value="3">High</option>
            <option value="2">Medium</option>
            <option value="1">Low</option>
          </select>
          <button
            onClick={() => user ? navigate('/submit') : setShowModal(true)}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dk transition-colors whitespace-nowrap">
            + Report Issue
          </button>
        </div>
      </div>

      {/* Map with clickable points */}
      <div className="mb-4 rounded-xl overflow-hidden border border-border shadow-sm">
        <MapContainer center={KIGALI_CENTER} zoom={13}
          scrollWheelZoom={true} style={{ height: '60vh', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap canvas layer */}
          {heatPoints.length > 0 && <HeatmapLayer points={heatPoints} />}

          {/* Invisible clickable markers on top of each report — ALL active
              reports, independent of the card grid's current page */}
          {!mapLoading && visibleMapReports.map(report => (
            <CircleMarker
              key={report.report_id}
              center={[report.latitude, report.longitude]}
              radius={12}
              pathOptions={{
                color: SEVERITY_COLORS[report.severity],
                fillColor: SEVERITY_COLORS[report.severity],
                fillOpacity: 0,   // invisible — heatmap shows instead
                opacity: 0,       // invisible border too
                weight: 0,
              }}
            >
              <Popup maxWidth={280}>
                <div className="p-1">
                  {/* Severity badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SEVERITY_COLORS[report.severity] }} />
                    <span className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: SEVERITY_COLORS[report.severity] }}>
                      {SEVERITY_LABELS[report.severity]}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{report.category_name}</span>
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-sm text-gray-900 mb-1 leading-snug">
                    {report.title}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">{report.district_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(report.created_at).toLocaleDateString('en-RW', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* View full report button */}
                  <button
                    onClick={() => navigate(`/reports/${report.report_id}`)}
                    className="w-full bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-primary-dk transition-colors">
                    View Full Report →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Heatmap legend */}
      <div className="flex items-center gap-4 text-xs text-text-muted mb-6">
        <span className="font-medium text-text-main">Severity:</span>
        {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {SEVERITY_LABELS[level]}
          </span>
        ))}
      </div>

      {/* Report cards — paginated */}
      <h2 className="text-lg font-semibold text-text-main mb-4">
        All Reports
        {pagination.total > 0 && (
          <span className="text-text-muted font-normal text-sm ml-2">({pagination.total})</span>
        )}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-36 bg-gray-100 rounded-lg mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-medium">No reports found.</p>
          <Link to="/submit"
            className="inline-block mt-4 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dk transition-colors">
            Be the first to report an issue
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.map(report => (
              <ReportCard key={report.report_id} report={report} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            pageSizeOptions={[12, 24, 48]}
          />
        </>
      )}
      {showModal && <ReportLoginModal onClose={() => setShowModal(false)} />}
    </div>
  );
}