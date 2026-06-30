import { useState, useEffect } from 'react';
import api from '../services/api';

const SEVERITY_LABELS  = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const SEVERITY_COLORS  = {
  1: 'bg-gray-100 text-gray-700 border-gray-300',
  2: 'bg-amber-100 text-amber-700 border-amber-300',
  3: 'bg-orange-100 text-orange-700 border-orange-300',
  4: 'bg-red-100 text-red-700 border-red-300',
};

export default function VotePanel({ reportId, reportStatus }) {
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [voting,       setVoting]       = useState(false);
  const [voteError,    setVoteError]    = useState('');
  const [voteSuccess,  setVoteSuccess]  = useState('');

  const isClosed = reportStatus === 'resolved';

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/votes/${reportId}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Could not load vote summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSummary(); }, [reportId]);

  const handleVote = async (voteType) => {
    setVoting(true); setVoteError(''); setVoteSuccess('');
    try {
      await api.post(`/votes/${reportId}`, { vote_type: voteType });
      await fetchSummary(); // refresh in real time
      setVoteSuccess('Your vote has been recorded.');
      setTimeout(() => setVoteSuccess(''), 3000);
    } catch (err) {
      setVoteError(err.response?.data?.error || 'Could not record vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-1/3 mb-4" />
        <div className="h-12 bg-gray-100 rounded mb-3" />
        <div className="h-8 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  const s = summary;
  const totalVoters     = (s?.vote_upvotes || 0) + (s?.vote_downvotes || 0) + (s?.vote_abstentions || 0);
  const engagementRate  = s?.severity_calculation?.engagement_rate || 0;
  const severityIndex   = s?.severity_calculation?.severity_index  || 0;
  const activeSeverity  = s?.active_severity || s?.initial_severity;
  const severitySource  = s?.severity_source || 'unverified';
  const userVote        = s?.user_vote?.vote_type;
  const nextChange      = s?.user_vote?.next_change_allowed_at;

  const buttonClass = (type) => {
    const isSelected = userVote === type;
    const base = 'flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ';
    if (isSelected) {
      return base + {
        up:      'bg-green-500 border-green-500 text-white',
        down:    'bg-red-500 border-red-500 text-white',
        abstain: 'bg-gray-400 border-gray-400 text-white',
      }[type];
    }
    return base + 'border-border bg-bg hover:border-gray-300 text-text-main';
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="font-semibold text-text-main mb-1">Community Severity Vote</h2>
      <p className="text-text-muted text-xs mb-4">
        {isClosed
          ? 'Voting is closed — this report has been resolved.'
          : 'Vote to indicate how serious this infrastructure issue is in your experience.'}
      </p>

      {/* Current severity */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <p className="text-xs text-text-muted mb-0.5">Active Severity</p>
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border
            ${SEVERITY_COLORS[activeSeverity]}`}>
            {SEVERITY_LABELS[activeSeverity]}
          </span>
        </div>
        <div className="text-xs text-text-muted">
          {severitySource === 'community'
            ? '🗳️ Set by community vote'
            : '⚠️ Unverified — awaiting community votes'}
        </div>
      </div>

      {/* Vote counts */}
      {totalVoters > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { type: 'up',      label: 'Yes, problem', count: s?.vote_upvotes    || 0, color: 'text-green-600' },
            { type: 'down',    label: 'Not a problem',count: s?.vote_downvotes  || 0, color: 'text-red-500'   },
            { type: 'abstain', label: 'Unsure',        count: s?.vote_abstentions|| 0, color: 'text-gray-500'  },
          ].map(({ label, count, color }) => (
            <div key={label} className="text-center bg-bg border border-border rounded-lg p-2">
              <p className={`text-xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      {totalVoters > 0 && (
        <div className="flex gap-4 text-xs text-text-muted mb-4">
          <span>📊 {totalVoters} votes total</span>
          <span>Engagement: <strong>{engagementRate}%</strong></span>
          {severityIndex > 0 && <span>Severity Index: <strong>{severityIndex}%</strong></span>}
        </div>
      )}

      {/* Explanation */}
      {s?.severity_calculation?.explanation && (
        <div className="text-xs text-text-muted bg-bg border border-border rounded-lg px-3 py-2 mb-4 italic">
          {s.severity_calculation.explanation}
        </div>
      )}

      {/* Vote buttons */}
      {!isClosed && (
        <>
          {voteError && (
            <div className="text-danger text-xs mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {voteError}
            </div>
          )}
          {voteSuccess && (
            <div className="text-green-700 text-xs mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {voteSuccess}
            </div>
          )}

          <div className="flex gap-2 mb-2">
            {[
              { type: 'up',      label: '👍 Yes, problem' },
              { type: 'down',    label: '👎 Not a problem' },
              { type: 'abstain', label: '🤷 Unsure' },
            ].map(({ type, label }) => (
              <button key={type}
                onClick={() => handleVote(type)}
                disabled={voting}
                className={buttonClass(type)}>
                {label}
              </button>
            ))}
          </div>

          {userVote && nextChange && (
            <p className="text-xs text-text-muted text-center">
              You voted: <strong>{userVote === 'up' ? 'Yes, problem' : userVote === 'down' ? 'Not a problem' : 'Unsure'}</strong>
              {' · '}Can change after {new Date(nextChange).toLocaleDateString()}
            </p>
          )}

          {!userVote && (
            <p className="text-xs text-text-muted text-center">
              No account needed to vote · Each browser can vote once per report
            </p>
          )}
        </>
      )}
    </div>
  );
}