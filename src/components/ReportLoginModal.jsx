import { Link, useNavigate } from 'react-router-dom';

/**
 * Shown when a logged-out visitor clicks "Report Issue".
 *
 * this used to be titled "Sign in to Report" and say "You need a
 * CivicPulse account to submit an infrastructure report" which was
 * simply false. The backend has always accepted anonymous report
 * submission (optionalAuth on POST /reports), and this modal's own
 * "Continue browsing without an account" button only closed the modal 
 * it never actually navigated to the submission form, so a logged-out
 * visitor had no way to reach /submit at all (compounded by /submit
 * itself being wrapped in a login-required route, also fixed see
 * App.jsx). This is now framed as what it actually is: an optional
 * choice between signing up for SMS updates or reporting immediately
 * without an account, and the anonymous path actually goes to the form.
 */
export default function ReportLoginModal({ onClose }) {
  const navigate = useNavigate();

  const continueAnonymously = () => {
    onClose();
    navigate('/submit');
  };

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
          <h2 className="text-xl font-bold text-text-main">Before you report</h2>
          <p className="text-text-muted text-sm mt-2">
            You can report this issue right away, no account needed. Or, sign up
            first (under 2 minutes) to get an SMS when neighbours vote on it and
            to track its status.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={continueAnonymously}
            className="block w-full bg-primary text-white font-semibold py-3 rounded-xl text-center hover:bg-primary-dk transition-colors"
          >
            Report without an account →
          </button>
          <Link
            to="/auth/citizen"
            className="block w-full border border-border text-text-main font-medium py-3 rounded-xl text-center hover:border-primary hover:text-primary transition-colors"
          >
            Sign up / Log in for SMS updates
          </Link>
        </div>

        <button
          onClick={onClose}
          className="w-full text-sm text-text-muted hover:text-text-main mt-4 text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
