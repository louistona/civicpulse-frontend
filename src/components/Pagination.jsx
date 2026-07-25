/**
 * Reusable pagination bar: prev/next, numbered pages (with ellipsis for
 * large page counts), a "showing X–Y of N" summary, and a page-size
 * selector. Used by HomePage, ResolvedReportsPage, and
 * OfficialDashboardPage — anywhere a list is fetched from a paginated
 * backend endpoint that returns { data, pagination: { page, limit, total,
 * totalPages } }.
 *
 * Renders nothing when there's only one page and no data, so it never
 * clutters an empty or small list.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [12, 24, 48, 96],
}) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build a compact page-number list: always show first, last, current,
  // and one neighbour on each side; collapse the rest into "…".
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 || p === totalPages ||
      (p >= page - 1 && p <= page + 1)
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-border">
      <p className="text-xs text-text-muted order-2 sm:order-1">
        Showing <span className="font-medium text-text-main">{from}–{to}</span> of{' '}
        <span className="font-medium text-text-main">{total}</span>
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg transition-colors"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                ${p === page
                  ? 'bg-primary text-white'
                  : 'border border-border text-text-main hover:bg-bg'}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg transition-colors"
        >
          ›
        </button>
      </div>

      {onLimitChange && (
        <div className="flex items-center gap-2 order-3">
          <label className="text-xs text-text-muted whitespace-nowrap">Per page</label>
          <select
            value={limit}
            onChange={e => onLimitChange(parseInt(e.target.value, 10))}
            className="border border-border rounded-lg px-2 py-1 text-xs bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
