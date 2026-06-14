const STATUS_CONFIG = {
  received:     { label: 'Received',     color: 'bg-gray-100 text-gray-600'   },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700'   },
  in_progress:  { label: 'In Progress',  color: 'bg-amber-100 text-amber-700' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-700' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.received;
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}