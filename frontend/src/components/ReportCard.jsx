import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const SEVERITY_COLORS = {
  1: 'bg-gray-100 text-gray-600',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

export default function ReportCard({ report }) {
  return (
    <Link
      to={`/reports/${report.report_id}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:border-primary transition-all"
    >
      {/* Photo */}
      {report.photo_url && (
        <img
          src={report.photo_url}
          alt={report.title}
          className="w-full h-36 object-cover rounded-lg mb-3"
        />
      )}

      {/* Category + Severity badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs bg-bg border border-border text-text-muted px-2 py-0.5 rounded-full">
          {report.category_name}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[report.severity]}`}>
          {SEVERITY_LABELS[report.severity]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-text-main text-sm line-clamp-2 mb-1">
        {report.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-muted">{report.district_name}</span>
        <StatusBadge status={report.status} />
      </div>
    </Link>
  );
}