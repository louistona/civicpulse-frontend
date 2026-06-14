import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import api from '../services/api';
import ReportCard from '../components/ReportCard';
import { useAuth } from '../context/AuthContext';

// Inner component to add/update the heatmap layer
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.2: '#1A7A4A', 0.5: '#E89B2F', 0.8: '#F97316', 1.0: '#D9534F' },
    });
    heat.addTo(map);
    return () => map.removeLayer(heat); // cleanup on re-render
  }, [points, map]);

  return null;
}

export default function HomePage() {
  const [reports, setReports]   = useState([]);
  const [heatPoints, setHeat]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState({ category: '', severity: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Kigali center coordinates
  const KIGALI_CENTER = [-1.9441, 30.0619];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, heatmapRes] = await Promise.all([
          api.get('/reports', { params: filter }),
          api.get('/heatmap'),
        ]);
        setReports(reportsRes.data);
        setHeat(heatmapRes.data.points);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Infrastructure Reports</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Gasabo District, Kigali · Live heatmap of active issues
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter.severity}
            onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All severities</option>
            <option value="4">Critical</option>
            <option value="3">High</option>
            <option value="2">Medium</option>
            <option value="1">Low</option>
          </select>

          {/* Submit button — only for logged-in citizens */}
          {user?.role === 'citizen' && (
            <button
              onClick={() => navigate('/submit')}
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dk transition-colors"
            >
            + Report Issue
             </button>
          )}

          {!user && (
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dk transition-colors"
            >
              Log in to report
            </button>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-8 rounded-xl overflow-hidden border border-border shadow-sm">
        <MapContainer
          center={KIGALI_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {heatPoints.length > 0 && <HeatmapLayer points={heatPoints} />}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-text-muted mb-6">
        <span className="font-medium text-text-main">Heatmap intensity:</span>
        {[
          { color: '#1A7A4A', label: 'Low' },
          { color: '#E89B2F', label: 'Medium' },
          { color: '#F97316', label: 'High' },
          { color: '#D9534F', label: 'Critical' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Report cards grid */}
      <h2 className="text-lg font-semibold text-text-main mb-4">
        Recent Reports {reports.length > 0 && <span className="text-text-muted font-normal text-sm">({reports.length})</span>}
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
          <p className="text-lg">No reports found.</p>
          <p className="text-sm mt-1">Be the first to report an issue in your area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map(report => (
            <ReportCard key={report.report_id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}