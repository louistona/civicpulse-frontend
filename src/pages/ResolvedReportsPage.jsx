import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
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

export default function ResolvedReportsPage() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // UX FIX: this page used to fetch every resolved report in one
  // unbounded request and render them all in a single scrolling list.
  // Now paginated via the shared hook, same as HomePage and
  // OfficialDashboardPage.
  const {
    reports, loading, pagination,
    page, setPage, limit, setLimit,
  } = usePaginatedReports({ resolved_only: 'true' }, 12);

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-RW', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-main">
          Resolved Reports
          {pagination.total > 0 && (
            <span className="text-text-muted font-normal text-lg ml-2">({pagination.total})</span>
          )}
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Infrastructure issues that have been marked as resolved by government officials.
          You can vote to confirm whether the issue was genuinely fixed.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
        <p className="text-amber-700 text-sm">
          If a resolved report receives <strong>10 or more "Not Resolved"</strong> votes,
          it is automatically sent back to Under Review and the responsible official is notified.
          Registered users carry more weight in the voting system.
        </p>
      </div>

      {/* Reports */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-medium">No resolved reports yet</p>
          <p className="text-sm mt-1">Resolved reports will appear here once officials mark issues as fixed.</p>
          <Link to="/" className="inline-block mt-4 text-primary hover:underline text-sm">
            ← Back to active reports
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map(report => {
              const totalVotes = (report.resolution_upvotes || 0) + (report.resolution_downvotes || 0);
              const downvotePct = totalVotes > 0
                ? Math.round(((report.resolution_downvotes || 0) / 10) * 100)
                : 0;

              return (
                <div key={report.report_id}
                  className="bg-surface border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          ✅ Resolved
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[report.severity]}`}>
                          {SEVERITY_LABELS[report.severity]}
                        </span>
                        <span className="text-xs text-text-muted bg-bg border border-border px-2 py-0.5 rounded-full">
                          {report.category_name}
                        </span>
                        {report.revert_count > 0 && (
                          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            ↩ Reverted {report.revert_count}x
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-text-main text-sm leading-snug">
                        {report.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {report.district_name} · {formatDate(report.created_at)}
                      </p>
                    </div>
                    <Link
                      to={`/reports/${report.report_id}`}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dk transition-colors font-medium flex-shrink-0"
                    >
                      View & Vote →
                    </Link>
                  </div>

                  {/* Mini resolution vote bar */}
                  {totalVotes > 0 && (
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                        <span>Community verification</span>
                        <span>
                          ✅ {report.resolution_upvotes || 0} fixed ·
                          ❌ {report.resolution_downvotes || 0} not fixed
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all
                            ${downvotePct >= 70 ? 'bg-danger' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(100, downvotePct)}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {report.resolution_downvotes || 0} of 10 "Not Resolved" votes
                      </p>
                    </div>
                  )}

                  {totalVotes === 0 && (
                    <p className="text-xs text-text-muted border-t border-border pt-2 mt-2">
                      No community verification votes yet. Be the first to confirm
                    </p>
                  )}
                </div>
              );
            })}
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
    </div>
  );
}