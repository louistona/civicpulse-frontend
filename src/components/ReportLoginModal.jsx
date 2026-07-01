import { Link } from 'react-router-dom';

export default function ReportLoginModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-xl font-bold text-text-main">Sign in to Report</h2>
          <p className="text-text-muted text-sm mt-2">
            You need a CivicPulse account to submit an infrastructure report.
            Creating one takes under 2 minutes.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/auth/citizen"
            className="block w-full bg-primary text-white font-semibold py-3 rounded-xl text-center hover:bg-primary-dk transition-colors"
          >
            Sign Up as Citizen
          </Link>
          <Link
            to="/auth/citizen"
            className="block w-full border border-border text-text-main font-medium py-3 rounded-xl text-center hover:border-primary hover:text-primary transition-colors"
          >
            Log In
          </Link>
        </div>

        <button
          onClick={onClose}
          className="w-full text-sm text-text-muted hover:text-text-main mt-4 text-center"
        >
          Continue browsing without an account
        </button>

        <p className="text-xs text-text-muted text-center mt-3">
          You can still view the map, heatmap, and all reports without signing in.
        </p>
      </div>
    </div>
  );
}