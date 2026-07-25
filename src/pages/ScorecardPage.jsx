import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Returns a color class based on the percentage value
const getPercentageColor = (pct) => {
  const num = parseFloat(pct);
  if (isNaN(num) || num === 0) return 'text-gray-400';
  if (num >= 75) return 'text-green-600';
  if (num >= 40) return 'text-amber-600';
  return 'text-red-600';
};

// Returns a background color for the progress bar
const getBarColor = (pct) => {
  const num = parseFloat(pct);
  if (isNaN(num) || num === 0) return 'bg-gray-200';
  if (num >= 75) return 'bg-green-500';
  if (num >= 40) return 'bg-amber-500';
  return 'bg-red-500';
};

// A single percentage display with a progress bar
function MetricBar({ value, label }) {
  const pct = parseFloat(value) || 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-text-muted">{label}</span>
        <span className={`text-sm font-bold ${getPercentageColor(pct)}`}>
          {pct > 0 ? `${pct}%` : '—'}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getBarColor(pct)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Grade based on resolved percentage
const getGrade = (resolvedPct) => {
  const pct = parseFloat(resolvedPct) || 0;
  if (pct >= 75) return { grade: 'A', color: 'bg-green-100 text-green-700 border-green-200' };
  if (pct >= 50) return { grade: 'B', color: 'bg-blue-100 text-blue-700 border-blue-200'  };
  if (pct >= 25) return { grade: 'C', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  if (pct >  0)  return { grade: 'D', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  return           { grade: 'F', color: 'bg-red-100 text-red-700 border-red-200' };
};

export default function ScorecardPage() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  // UX FIX: districts previously rendered in whatever order the API
  // returned them, with no way to bring the best- or worst-performing
  // district to the top. Only 3 districts exist today (Kigali), but this
  // page is the one most likely to grow nationally, so sorting is added
  // now rather than only pagination — with a small, fixed number of rows,
  // sort + a compact/expanded toggle is more useful than paging.
  const [sortBy, setSortBy] = useState('resolved_desc');

  useEffect(() => {
    api.get('/reports/scorecard')
      .then(res => setData(res.data))
      .catch(() => setError('Could not load scorecard data.'))
      .finally(() => setLoading(false));
  }, []);

  const sortedData = useMemo(() => {
    const copy = [...data];
    switch (sortBy) {
      case 'resolved_desc':
        return copy.sort((a, b) => parseFloat(b.resolved_pct || 0) - parseFloat(a.resolved_pct || 0));
      case 'resolved_asc':
        return copy.sort((a, b) => parseFloat(a.resolved_pct || 0) - parseFloat(b.resolved_pct || 0));
      case 'acknowledged_desc':
        return copy.sort((a, b) => parseFloat(b.acknowledged_pct || 0) - parseFloat(a.acknowledged_pct || 0));
      case 'reports_desc':
        return copy.sort((a, b) => parseInt(b.total_reports || 0) - parseInt(a.total_reports || 0));
      case 'name_asc':
        return copy.sort((a, b) => (a.district_name || '').localeCompare(b.district_name || ''));
      default:
        return copy;
    }
  }, [data, sortBy]);

  // Calculate overall totals for the summary row
  const totals = data.reduce((acc, d) => ({
    total_reports:    acc.total_reports + parseInt(d.total_reports || 0),
    acknowledged_sum: acc.acknowledged_sum + parseFloat(d.acknowledged_pct || 0),
    resolved_sum:     acc.resolved_sum + parseFloat(d.resolved_pct || 0),
  }), { total_reports: 0, acknowledged_sum: 0, resolved_sum: 0 });

  const avgAcknowledged = data.length > 0
    ? (totals.acknowledged_sum / data.length).toFixed(1) : '0';
  const avgResolved = data.length > 0
    ? (totals.resolved_sum / data.length).toFixed(1) : '0';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/" className="text-sm text-text-muted hover:text-primary">
            ← Back to map
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-text-main">Government Accountability Scorecard</h1>
        <p className="text-text-muted text-sm mt-1 max-w-2xl">
          This scorecard tracks how quickly and completely each district responds to
          citizen-reported infrastructure issues. Data updates in real time as officials
          act on reports.
        </p>
      </div>

      {/* Summary cards */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Reports',
              value: totals.total_reports,
              sub: 'across all districts',
              color: 'border-primary/20 bg-primary/5',
            },
            {
              label: 'Avg. Acknowledged',
              value: `${avgAcknowledged}%`,
              sub: 'of reports received a response',
              color: parseFloat(avgAcknowledged) >= 50
                ? 'border-green-200 bg-green-50'
                : 'border-amber-200 bg-amber-50',
            },
            {
              label: 'Avg. Resolved',
              value: `${avgResolved}%`,
              sub: 'of reports fully resolved',
              color: parseFloat(avgResolved) >= 50
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50',
            },
          ].map(card => (
            <div key={card.label}
              className={`border rounded-xl p-5 ${card.color}`}
            >
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-text-main">{card.value}</p>
              <p className="text-xs text-text-muted mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Scorecard table */}
      {!loading && !error && data.length > 1 && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            {data.length} district{data.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted whitespace-nowrap">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-border rounded-lg px-2 py-1.5 text-xs bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="resolved_desc">Resolved % (high to low)</option>
              <option value="resolved_asc">Resolved % (low to high)</option>
              <option value="acknowledged_desc">Acknowledged % (high to low)</option>
              <option value="reports_desc">Most reports</option>
              <option value="name_asc">District name (A–Z)</option>
            </select>
          </div>
        </div>
      )}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-32 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-xl px-4 py-6 text-center">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-medium">No data yet</p>
          <p className="text-sm mt-1">Reports need to be submitted before scorecard data appears.</p>
          <Link to="/submit"
            className="inline-block mt-4 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dk transition-colors">
            Submit a Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedData.map((district) => {
            const { grade, color: gradeColor } = getGrade(district.resolved_pct);
            return (
              <div
                key={district.district_id}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                {/* District header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-text-main">
                      {district.district_name}
                    </h2>
                    <p className="text-text-muted text-xs mt-0.5">
                      {district.total_reports} report{district.total_reports !== 1 ? 's' : ''} submitted
                    </p>
                  </div>
                  {/* Grade badge */}
                  <div className={`border rounded-lg px-3 py-1 text-center min-w-[52px] ${gradeColor}`}>
                    <p className="text-2xl font-bold leading-none">{grade}</p>
                    <p className="text-xs mt-0.5">grade</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricBar
                    value={district.acknowledged_pct}
                    label="Acknowledged"
                  />
                  <MetricBar
                    value={district.resolved_pct}
                    label="Resolved"
                  />
                </div>

                {/* Response time */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-muted">Average response time</span>
                  <span className="text-sm font-semibold text-text-main">
                    {district.avg_response_days
                      ? `${district.avg_response_days} day${parseFloat(district.avg_response_days) !== 1 ? 's' : ''}`
                      : 'No responses yet'
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Methodology note */}
      <div className="mt-8 bg-bg border border-border rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
          Methodology
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          <strong className="text-text-main">Acknowledged %</strong> — the share of reports that have
          received at least one official status update beyond "received." &nbsp;
          <strong className="text-text-main">Resolved %</strong> — the share of reports marked as
          fully resolved. &nbsp;
          <strong className="text-text-main">Average response time</strong> — median days between
          report submission and the first official action. Grades are assigned based on resolved
          percentage: A ≥ 75%, B ≥ 50%, C ≥ 25%, D &gt; 0%, F = no resolutions.
          Data is live and updates whenever an official acts on a report.
        </p>
      </div>
    </div>
  );
}