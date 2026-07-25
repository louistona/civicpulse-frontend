import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import usePaginatedReports from '../hooks/usePaginatedReports';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const SEVERITY_COLORS = {
  1: 'bg-gray-100 text-gray-600',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

export default function OfficialDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters,    setFilters]    = useState({ category: '', severity: '', district: '', status: '' });
  const [categories, setCategories] = useState([]);
  const [districts,  setDistricts]  = useState([]);
  const [stats,      setStats]      = useState({ total: 0, received: 0, in_progress: 0, resolved: 0 });

  // UX FIX: this list used to fetch every matching report in one
  // unbounded request with no cap in the UI — the exact page an official
  // needs most (triaging incoming reports) was also the most likely to get
  // overcrowded. Now paginated via the shared hook; only non-empty filter
  // values are passed through, and the hook resets to page 1 automatically
  // whenever the filter set changes.
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '')
  );
  const {
    reports, loading, pagination,
    page, setPage, limit, setLimit,
  } = usePaginatedReports(activeFilters, 20);

  // Redirect non-officials away from this page
  useEffect(() => {
    if (user && user.role !== 'official') navigate('/');
    // FIX: was navigate('/auth') which sends to the citizen login page.
    // Officials whose session has expired should be sent to the official
    // login page, not the citizen page with a phone + PIN form.
    if (!user) navigate('/auth/official');
  }, [user, navigate]);

  // Load filter dropdown data once
  useEffect(() => {
    Promise.all([
      api.get('/reports/categories'),
      api.get('/reports/districts'),
    ]).then(([c, d]) => {
      setCategories(c.data);
      setDistricts(d.data);
    });
  }, []);

  // True, unfiltered-by-status counts for the stat cards — see
  // getReportStats in reportController.js. Independent of the paginated
  // list above.
  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.district) params.district = filters.district;

    api.get('/reports/stats', { params })
      .then(res => setStats(res.data))
      .catch(() => {});
  }, [filters.category, filters.district]);

  const formatDate = iso => new Date(iso).toLocaleDateString('en-RW', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-main">Official Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Welcome, {user?.name} · Manage and respond to citizen infrastructure reports
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reports',   value: stats.total,       color: 'bg-bg border-border' },
          { label: 'Awaiting Action', value: stats.received,    color: 'bg-red-50 border-red-200' },
          { label: 'In Progress',     value: stats.in_progress, color: 'bg-amber-50 border-amber-200' },
          { label: 'Resolved',        value: stats.resolved,    color: 'bg-green-50 border-green-200' },
        ].map(stat => (
          <div key={stat.label} className={`border rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-bold text-text-main">{stat.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Filter Reports
          </p>
          {pagination.total > 0 && (
            <p className="text-xs text-text-muted">{pagination.total} matching</p>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Status and Severity filters */}
          {[
            {
              label: 'Status', key: 'status',
              options: [
                { value: '',              label: 'All statuses' },
                { value: 'received',      label: 'Received' },
                { value: 'under_review',  label: 'Under Review' },
                { value: 'in_progress',   label: 'In Progress' },
                { value: 'resolved',      label: 'Resolved' },
              ],
            },
            {
              label: 'Severity', key: 'severity',
              options: [
                { value: '',  label: 'All severities' },
                { value: '4', label: 'Critical' },
                { value: '3', label: 'High' },
                { value: '2', label: 'Medium' },
                { value: '1', label: 'Low' },
              ],
            },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="block text-xs text-text-muted mb-1">{label}</label>
              <select
                value={filters[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Category filter */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Category</label>
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* District filter */}
          <div>
            <label className="block text-xs text-text-muted mb-1">District</label>
            <select
              value={filters.district}
              onChange={e => setFilters(f => ({ ...f, district: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All districts</option>
              {districts.map(d => (
                <option key={d.district_id} value={d.district_id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset filters button — only shown when at least one filter is active */}
        {Object.values(filters).some(v => v !== '') && (
          <button
            onClick={() => setFilters({ category: '', severity: '', district: '', status: '' })}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-medium">No reports match your filters.</p>
          <button
            onClick={() => setFilters({ category: '', severity: '', district: '', status: '' })}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report.report_id}
                className="bg-surface border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[report.severity]}`}>
                        {SEVERITY_LABELS[report.severity]}
                      </span>
                      <span className="text-xs text-text-muted bg-bg border border-border px-2 py-0.5 rounded-full">
                        {report.category_name}
                      </span>
                      <span className="text-xs text-text-muted">{report.district_name}</span>
                    </div>
                    <h3 className="font-semibold text-text-main text-sm truncate">
                      {report.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Submitted by {report.submitted_by || report.submitter_name || 'Anonymous'} · {formatDate(report.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={report.status} />
                    <Link
                      to={`/reports/${report.report_id}`}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dk transition-colors font-medium"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            pageSizeOptions={[10, 20, 50]}
          />
        </>
      )}
    </div>
  );
}