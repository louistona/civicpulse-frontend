import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * Fetches a page of /api/reports for any of the three report-list pages
 * (HomePage, ResolvedReportsPage, OfficialDashboardPage), all of which
 * share the same shape of paginated response:
 *   { reports: [...], pagination: { page, limit, total, totalPages } }
 *
 * `extraParams` (e.g. { severity, category, district, status,
 * resolved_only }) are merged into the query string. The page resets to 1
 * automatically whenever extraParams changes (e.g. the user picks a new
 * filter) — otherwise you could land on "page 4" of a filtered set that
 * only has 1 page, which would silently render nothing.
 */
export default function usePaginatedReports(extraParams = {}, initialLimit = 24) {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(initialLimit);
  const [pagination, setPagination] = useState({ page: 1, limit: initialLimit, total: 0, totalPages: 1 });

  // Track the previous serialized filter set so we only reset to page 1
  // when a filter actually changes, not on every render.
  const prevFiltersKey = useRef(JSON.stringify(extraParams));

  useEffect(() => {
    const key = JSON.stringify(extraParams);
    if (key !== prevFiltersKey.current) {
      prevFiltersKey.current = key;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(extraParams)]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.get('/reports', { params: { ...extraParams, page, limit } })
      .then(res => {
        if (cancelled) return;
        setReports(res.data.reports);
        setPagination(res.data.pagination);
      })
      .catch(err => {
        if (!cancelled) console.error('Could not load reports:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(extraParams), page, limit]);

  return {
    reports, loading, pagination,
    page, setPage,
    limit, setLimit: (n) => { setLimit(n); setPage(1); },
  };
}
