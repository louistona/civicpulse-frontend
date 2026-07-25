# CivicPulse Frontend — Fix Log

Applied directly to this codebase. Companion to the backend `FIXES.md` —
several of these only make sense together with the matching backend change.

## 🔴 Critical

1. **`pages/SubmitReportPage.jsx` submitted a report and its photo as two
   separate, sequential API calls** (`POST /reports`, then
   `POST /photos/:id/submission`), with no shared transaction. If the
   second call failed, the whole `handleSubmit` function fell into its
   catch block and showed "Submission failed. Please try again." even
   though the report had already been created — so a citizen retrying the
   form created a **duplicate report**, and the original was left
   permanently missing its submission photo (the detail page only ever
   reads from `report_photos`, not `reports.photo_url`, and never did
   fall back to it). Fixed: `photo_url` is now sent directly in the single
   `POST /reports` call; the backend writes both rows atomically in one
   transaction (see backend `FIXES.md` #3). The second request is gone
   entirely from this flow.

## 🟠 Bugs

2. **`components/ResolutionVotePanel.jsx` had an unintentional continuous
   re-fetch loop.** It defined `fetch` as a plain (non-memoized) function
   on every render and included it in its own `useEffect` dependency
   array — each render created a new function reference, which the effect
   saw as a changed dependency, ran again, triggered a state update, and
   re-rendered, repeating indefinitely. (An `eslint-disable` comment had
   been used to silence the linter warning about this rather than fixing
   it.) Fixed by wrapping the fetch function in `useCallback` with
   `[reportId]` as its only dependency, matching the correct pattern
   already used in `VotePanel.jsx`.

3. **`pages/OfficialDashboardPage.jsx` computed its four stat cards by
   filtering the same paginated, filtered `GET /reports` list used for the
   report table below it.** That endpoint excludes resolved reports by
   default whenever no status filter is selected (the dashboard's default
   state), so the "Resolved" stat card always read 0 on page load, and
   every card undercounted once a district passed the endpoint's page
   size. Fixed: stats are now fetched separately from the new
   `GET /reports/stats` endpoint (see backend `FIXES.md` #12), independent
   of the report list's pagination and status filter.

## Notes on what was *not* changed

- `PhotoUploader.jsx` / `utils/uploadToCloudinary.js` (the direct-to-Cloudinary
  upload flow) were left as-is — they work correctly. Just be aware this
  relies on an **unsigned** Cloudinary upload preset, which is inherently
  visible to anyone who inspects the frontend bundle (cloud name + preset
  name are not secret). This is an accepted trade-off for a
  direct-browser-upload architecture at pilot scale, not a code bug, but
  it's worth knowing about — see the deployment guide for what to check.
- No changes were made to `LocationSelector.jsx`, `useLocationData.js`,
  `VotePanel.jsx`, or `api.js` — reviewed carefully, no bugs found in
  these files.

## 🟢 UX — pagination & list scale (added after initial fix round)

4. **Added `components/Pagination.jsx`** — a reusable pagination bar (prev/
   next, numbered pages with ellipsis, "showing X–Y of N", page-size
   selector) driven by the backend's `{ data, pagination }` response
   shape.

5. **Added `hooks/usePaginatedReports.js`** — shared fetch/state logic for
   any page listing `/api/reports`, so `HomePage`, `ResolvedReportsPage`,
   and `OfficialDashboardPage` don't each reimplement page state,
   filter-change resets, and stale-request handling separately. Resets to
   page 1 automatically whenever the filter set changes.

6. **`HomePage.jsx`** — the map now fetches all active reports from the
   new `GET /reports/map` endpoint (unpaginated, lightweight fields only),
   completely decoupled from the card grid below it, which is now
   paginated via the shared hook (12 per page by default). Previously the
   map and the card grid shared one array, so paginating the grid would
   have hidden map pins for reports on any page but the first.

7. **`ResolvedReportsPage.jsx`** — paginated via the shared hook (12 per
   page), with a live total count in the header.

8. **`OfficialDashboardPage.jsx`** — the report list is now paginated (20
   per page) via the shared hook; stat cards continue to use the separate,
   unpaginated `/reports/stats` endpoint from the earlier fix round, so
   they remain accurate regardless of which page or filters are active.

9. **`ScorecardPage.jsx`** — added a sort control (resolved %, acknowledged
   %, report count, district name). True pagination wasn't warranted at
   today's 3-district scale, but this is the page most likely to grow if
   the platform expands beyond Kigali, so sorting was added now rather
   than leaving districts in whatever order the API happened to return
   them.
