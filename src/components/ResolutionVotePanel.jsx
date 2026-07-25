import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function ResolutionVotePanel({ reportId, onReverted }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting,  setVoting]  = useState(false);
  const [message, setMessage] = useState('');

  // FIX: `fetch` was previously redefined on every render (a plain
  // function, not memoized) and included in its own effect's dependency
  // array. Every render created a new function reference -> the effect saw
  // a "changed" dependency -> ran again -> called setData/setLoading ->
  // triggered another render -> new function reference -> effect ran
  // again... This produced a tight, continuous re-fetch loop rather than
  // fetching once per reportId (an eslint-disable comment had been used to
  // silence the linter warning about this instead of fixing it). Wrapping
  // in useCallback with [reportId] as its only dependency gives the effect
  // a stable reference, so it now only re-runs when reportId actually
  // changes — matching the pattern already used correctly in VotePanel.jsx.
  const fetchVotes = useCallback(async () => {
    try {
      const res = await api.get(`/resolution-votes/${reportId}`);
      setData(res.data);
    } catch (err) {
      console.error('Could not load resolution votes:', err);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => { fetchVotes(); }, [fetchVotes]);

  const vote = async (voteType) => {
    setVoting(true); setMessage('');
    try {
      const res = await api.post(`/resolution-votes/${reportId}`, {
        vote_type: voteType
      });
      if (res.data.reverted) {
        setMessage('⚠️ Community has flagged this as unresolved. Report reverted to Under Review.');
        onReverted?.();
      } else {
        setMessage('Your vote was recorded.');
        setTimeout(() => setMessage(''), 3000);
      }
      await fetchVotes();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not record vote.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-100 rounded" />
    </div>
  );

  if (!data) return null;

  const { resolution_upvotes, resolution_downvotes,
          remaining_to_revert, threshold, user_vote } = data;
  const totalVotes = (resolution_upvotes || 0) + (resolution_downvotes || 0);
  const downvotePct = threshold > 0
    ? Math.min(100, Math.round((resolution_downvotes / threshold) * 100))
    : 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="font-semibold text-text-main mb-1 text-sm">
        Was This Issue Actually Resolved?
      </h2>
      <p className="text-text-muted text-xs mb-4">
        Community members can verify whether this issue was genuinely fixed.
        If {threshold} or more people vote "Not Resolved", the report is automatically
        sent back for review.
      </p>

      {/* Vote counts */}
      {totalVotes > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">{resolution_upvotes || 0}</p>
            <p className="text-xs text-green-700 font-medium mt-0.5">✅ Yes, it was fixed</p>
          </div>
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-2xl font-bold text-red-600">{resolution_downvotes || 0}</p>
            <p className="text-xs text-red-700 font-medium mt-0.5">❌ No, still a problem</p>
          </div>
        </div>
      )}

      {/* Revert progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Revert threshold</span>
          <span className={`font-semibold ${downvotePct >= 70 ? 'text-danger' : 'text-text-muted'}`}>
            {resolution_downvotes || 0} / {threshold} "Not Resolved" votes
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500
              ${downvotePct >= 70 ? 'bg-danger' : downvotePct >= 40 ? 'bg-warning' : 'bg-green-400'}`}
            style={{ width: `${downvotePct}%` }}
          />
        </div>
        {remaining_to_revert > 0 && (resolution_downvotes || 0) > 0 && (
          <p className="text-xs text-text-muted mt-1">
            {remaining_to_revert} more "Not Resolved" votes needed to trigger a review
          </p>
        )}
      </div>

      {/* Vote buttons */}
      {message && (
        <div className={`text-xs rounded-lg px-3 py-2 mb-3
          ${message.includes('⚠️')
            ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => vote('up')}
          disabled={voting}
          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all
            ${user_vote?.vote_type === 'up'
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-border bg-bg hover:border-green-400 hover:text-green-700'}`}
        >
          ✅ Yes, it was fixed
        </button>
        <button
          onClick={() => vote('down')}
          disabled={voting}
          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all
            ${user_vote?.vote_type === 'down'
              ? 'bg-red-500 border-red-500 text-white'
              : 'border-border bg-bg hover:border-red-400 hover:text-red-600'}`}
        >
          ❌ No, still a problem
        </button>
      </div>

      <p className="text-xs text-text-muted text-center mt-2">
        {user_vote
          ? `You voted: ${user_vote.vote_type === 'up' ? 'Yes, fixed' : 'Not resolved'}`
          : 'No account needed to vote · Registered users carry more weight'}
      </p>
    </div>
  );
}