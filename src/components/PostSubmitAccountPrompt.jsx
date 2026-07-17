import { Link } from 'react-router-dom';

/**
 * Shown after a successful anonymous report submission.
 * Offers the user an optional account to receive SMS vote notifications.
 */
export default function PostSubmitAccountPrompt({ reportId, onDismiss }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onDismiss}>
      <div className="bg-surface rounded-2xl shadow-2xl p-8 max-w-sm w-full"
        onClick={e => e.stopPropagation()}>

        {/* Icon */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">📱</div>
          <h2 className="text-xl font-bold text-text-main">Your report was submitted!</h2>
          <p className="text-text-muted text-sm mt-2 leading-relaxed">
            Want to be notified when your neighbours vote on new reports in your area?
          </p>
        </div>

        {/* Value prop */}
        <div className="bg-bg border border-border rounded-xl p-4 mb-5 space-y-2">
          {[
            { icon: '🗳️', text: 'Receive SMS when reports are posted in your cell' },
            { icon: '📊', text: 'Vote on severity to help prioritise government response' },
            { icon: '🔔', text: 'Track the status of your own reports' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 text-sm text-text-main">
              <span className="text-base flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted text-center mb-4">
          Creating an account is <strong>completely optional</strong>. Your report has
          already been submitted and is visible on the map.
        </p>

        <div className="space-y-3">
          <Link
            to="/auth/citizen"
            className="block w-full bg-primary text-white font-semibold py-3 rounded-xl text-center hover:bg-primary-dk transition-colors text-sm"
          >
            Create a free account →
          </Link>

          <Link
            to={`/reports/${reportId}`}
            className="block w-full border border-border text-text-main font-medium py-3 rounded-xl text-center hover:border-primary hover:text-primary transition-colors text-sm"
          >
            View my submitted report
          </Link>
        </div>

        <button
          onClick={onDismiss}
          className="w-full text-xs text-text-muted hover:text-text-main mt-3 text-center py-1"
        >
          No thanks, continue without an account
        </button>
      </div>
    </div>
  );
}