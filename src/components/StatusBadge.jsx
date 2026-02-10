const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 border-amber-200/60',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-apl-blue/10 text-apl-blue-dark border-apl-blue/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-teal-50 text-teal-800 border-teal-200/60',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
  },
  'no-show': {
    label: 'No Show',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
  },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
