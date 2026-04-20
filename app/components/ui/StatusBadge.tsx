interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-800' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
  ON_TRACK: { bg: 'bg-green-100', text: 'text-green-800' },
  on_track: { bg: 'bg-green-100', text: 'text-green-800' },
  OFF_TRACK: { bg: 'bg-red-100', text: 'text-red-800' },
  off_track: { bg: 'bg-red-100', text: 'text-red-800' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  STOPPED: { bg: 'bg-gray-200', text: 'text-gray-600' },
  stopped: { bg: 'bg-gray-200', text: 'text-gray-600' },
  KEEP_GOING: { bg: 'bg-green-100', text: 'text-green-800' },
  IMPROVE: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

const statusLabel: Record<string, string> = {
  PENDING: '대기',
  pending: '대기',
  ON_TRACK: '순항',
  on_track: '순항',
  OFF_TRACK: '난항',
  off_track: '난항',
  COMPLETED: '완료',
  completed: '완료',
  STOPPED: '중단',
  stopped: '중단',
  KEEP_GOING: '계속해 주세요',
  IMPROVE: '보완해 주세요',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const displayLabel = label || statusLabel[status] || status;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {displayLabel}
    </span>
  );
}
