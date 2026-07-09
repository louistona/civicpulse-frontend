import { useState } from 'react';

/**
 * Displays all photos for a report in two clearly separated sections:
 *   1. Reported Condition  — submission photos (the problem evidence)
 *   2. Resolution Evidence — resolution photos (proof of fix)
 *
 * Each photo is clickable and opens a full-screen lightbox.
 * For resolved reports with both photo types, shows a "before and after" label.
 *
 * Props:
 *   photos        — { submission: [...], resolution: [...] }
 *   reportStatus  — the current report status string
 */
export default function ReportPhotos({ photos, reportStatus }) {
  const [lightbox, setLightbox] = useState(null); // photo object or null

  const submissionPhotos = photos?.submission || [];
  const resolutionPhotos = photos?.resolution || [];
  const hasSubmission    = submissionPhotos.length > 0;
  const hasResolution    = resolutionPhotos.length > 0;
  const isResolved       = reportStatus === 'resolved';

  // Nothing to show at all
  if (!hasSubmission && !hasResolution) {
    return (
      <div className="bg-bg border-2 border-dashed border-border rounded-xl p-8 text-center">
        <div className="text-3xl mb-2">📷</div>
        <p className="text-text-muted text-sm font-medium">No photos attached</p>
        <p className="text-text-muted text-xs mt-1">
          No photo was submitted with this report
        </p>
      </div>
    );
  }

  const PhotoItem = ({ photo }) => (
    <button
      onClick={() => setLightbox(photo)}
      className="relative group w-full overflow-hidden rounded-xl border border-border block"
    >
      <img
        src={photo.photo_url}
        alt={photo.caption || 'Report photo'}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full">
          🔍 View full size
        </span>
      </div>
      {/* Caption strip */}
      {photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
          <p className="text-white text-xs line-clamp-2 text-left">{photo.caption}</p>
        </div>
      )}
    </button>
  );

  return (
    <>
      <div className="space-y-5">

        {/* ── Section 1: Reported Condition ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              📸 Reported Condition
            </span>
            <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              Problem evidence
            </span>
          </div>

          {hasSubmission ? (
            <div className={`grid gap-2 ${submissionPhotos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {submissionPhotos.map((photo, idx) => (
                <PhotoItem key={photo.photo_id || idx} photo={photo} />
              ))}
            </div>
          ) : (
            <div className="bg-bg border border-dashed border-border rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs">No submission photo provided</p>
            </div>
          )}
        </div>

        {/* ── Section 2: Resolution Evidence ──
            Show this section whenever the report is resolved OR resolution
            photos already exist (officials may upload before status change) */}
        {(isResolved || hasResolution) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                ✅ Resolution Evidence
              </span>
              {hasResolution && (
                <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  Proof of fix
                </span>
              )}
            </div>

            {hasResolution ? (
              <div className={`grid gap-2 ${resolutionPhotos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {resolutionPhotos.map((photo, idx) => (
                  <PhotoItem key={photo.photo_id || idx} photo={photo} />
                ))}
              </div>
            ) : (
              <div className="bg-bg border border-dashed border-border rounded-xl p-4 text-center">
                <p className="text-text-muted text-xs">
                  {isResolved
                    ? 'No resolution photo was uploaded by the official'
                    : 'Resolution photo will appear here when the issue is resolved'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Before/After banner — only for fully resolved reports with both ── */}
        {isResolved && hasSubmission && hasResolution && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
            <p className="text-green-700 text-xs font-medium">
              ✅ Issue resolved. The photos above show the before condition (top) and
              the after condition (bottom) as verified by the district official.
            </p>
          </div>
        )}

      </div>

      {/* ── Lightbox modal ── */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox.photo_url}
              alt={lightbox.caption || 'Report photo'}
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            {lightbox.caption && (
              <p className="text-white text-sm text-center mt-3 opacity-75 px-4">
                {lightbox.caption}
              </p>
            )}
            {/* Close button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition-colors shadow-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}