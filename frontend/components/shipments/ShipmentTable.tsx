import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import StatusBadge from '@/components/shipments/StatusBadge'
import type { ShipmentListItem } from '@/types/shipment'

type ShipmentTableProps = {
  shipments: ShipmentListItem[]
  onCreateClick: () => void
}

export default function ShipmentTable({ shipments, onCreateClick }: ShipmentTableProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live list</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recent shipments</h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCreateClick} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New shipment
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Tracking</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Receiver</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">City</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">COD</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No shipments available yet.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-200">
                        <Package className="h-4 w-4" />
                      </span>
                      <div>
                        <div>{shipment.tracking_number ?? `TRK-${shipment.id}`}</div>
                        <div className="text-xs text-slate-500">{shipment.sender_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <div className="font-medium text-white">{shipment.receiver_name}</div>
                    <div className="text-xs text-slate-500">{shipment.receiver_phone}</div>
                  </td>
                  <td className="py-5 pr-6">{shipment.city}</td>
                  <td className="py-5 pr-6">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="py-5 pr-6">{shipment.cod_amount != null ? `EGP ${shipment.cod_amount}` : '—'}</td>
                  <td className="py-5 pr-6">{shipment.estimated_delivery_days} days</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
