import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import VotePanel from '../components/VotePanel';
import StatusBadge from '../components/StatusBadge';

// eslint-disable-next-line no-unused-vars
const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };

export default function VotingPage() {
  const { id } = useParams();
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(res => setReport(res.data))
      .catch(() => setError('Report not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-32 bg-gray-200 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto px-4 py-8 text-center">
      <p className="text-danger">{error}</p>
      <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">← Home</Link>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-text-muted hover:text-primary mb-4 inline-block">
        ← Back to CivicPulse
      </Link>

      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs bg-bg border border-border text-text-muted px-2 py-0.5 rounded-full">
            {report.category_name}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <h1 className="text-lg font-bold text-text-main mb-1">{report.title}</h1>
        <p className="text-text-muted text-sm">
          📍 {report.cell_name}, {report.sector_name}, {report.district_name}
        </p>
        {report.description && (
          <p className="text-text-muted text-sm mt-2 line-clamp-3">{report.description}</p>
        )}
        <Link to={`/reports/${report.report_id}`}
          className="text-xs text-primary hover:underline mt-2 inline-block">
          View full report →
        </Link>
      </div>

      <VotePanel reportId={id} reportStatus={report.status} />

      <p className="text-xs text-text-muted text-center mt-4">
        You received this link because you are registered in the same cell as this report.
        <br />
        <Link to="/" className="text-primary hover:underline">Learn more about CivicPulse →</Link>
      </p>
    </div>
  );
}