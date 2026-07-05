import { ArrowRight } from 'lucide-react'

type RecentShipmentRow = {
  trackingNumber: string
  receiver: string
  city: string
  status: string
  assignedDriver: string
  createdAt: string
}

type RecentShipmentsTableProps = {
  shipments: RecentShipmentRow[]
}

function statusBadgeStyle(status: string) {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-500/15 text-emerald-200'
    case 'In Transit':
      return 'bg-amber-500/15 text-amber-200'
    case 'Pending':
      return 'bg-sky-500/15 text-sky-200'
    case 'Returned':
      return 'bg-rose-500/15 text-rose-200'
    default:
      return 'bg-slate-700/20 text-slate-200'
  }
}

export default function RecentShipmentsTable({ shipments }: RecentShipmentsTableProps) {
  return (
    <section className="glass-card rounded-[24px] border-white/10 p-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Recent shipments</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Latest movement</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[18px] border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
          View all shipments
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/6 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Tracking Number</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Receiver</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">City</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Assigned Driver</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {shipments.map((shipment) => (
              <tr key={shipment.trackingNumber} className="transition hover:bg-white/6">
                <td className="py-5 pr-6 font-semibold text-white">{shipment.trackingNumber}</td>
                <td className="py-5 pr-6 text-base">{shipment.receiver}</td>
                <td className="py-5 pr-6">{shipment.city}</td>
                <td className="py-5 pr-6">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-white/6 ${statusBadgeStyle(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="py-5 pr-6">{shipment.assignedDriver}</td>
                <td className="py-5 pr-6">{shipment.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
