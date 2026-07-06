import type { ShipmentStatus } from '@/constants/shipment'

type StatusBadgeProps = {
  status: ShipmentStatus | string
}

function statusBadgeStyle(status: ShipmentStatus | string) {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-500/15 text-emerald-200'
    case 'In Transit':
      return 'bg-amber-500/15 text-amber-200'
    case 'Pending':
      return 'bg-sky-500/15 text-sky-200'
    case 'Cancelled':
      return 'bg-rose-500/15 text-rose-200'
    default:
      return 'bg-slate-700/20 text-slate-200'
  }
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-white/10 ${statusBadgeStyle(status)}`}>
      {status}
    </span>
  )
}
