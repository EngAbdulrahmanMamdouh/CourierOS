"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SHIPMENT_STATUS_OPTIONS } from '@/constants/shipment'
import { updateShipmentStatus } from '@/services/shipment'
import { toast } from 'sonner'
import { useState } from 'react'

type RecentShipmentRow = {
  id?: number
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
      return 'bg-emerald-400/10 text-emerald-400'
    case 'In Transit':
      return 'bg-sky-400/10 text-sky-400'
    case 'Pending':
      return 'bg-amber-400/10 text-amber-400'
    case 'Cancelled':
      return 'bg-rose-400/10 text-rose-400'
    case 'Returned':
      return 'bg-rose-400/10 text-rose-400'
    default:
      return 'bg-slate-700/20 text-slate-200'
  }
}

export default function RecentShipmentsTable({ shipments }: RecentShipmentsTableProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const handleStatusChange = async (shipmentId: number | undefined, nextStatus: string) => {
    if (!shipmentId || !nextStatus) return
    setUpdatingId(shipmentId)
    try {
      await updateShipmentStatus(shipmentId, nextStatus as any)
      toast.success('Shipment status updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update shipment status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="rounded-[16px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-150 hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Recent shipments</p>
          <h2 className="mt-2 text-[20px] font-semibold text-gray-50">Latest movement</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[12px] border border-white/[0.08] bg-slate-900/70 px-4 py-2 text-sm font-semibold text-gray-100 transition duration-150 hover:border-sky-400/40 hover:bg-slate-900">
          View all shipments
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-100">
          <thead>
            <tr className="border-b border-white/[0.05] text-gray-400">
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">Tracking Number</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">Receiver</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">City</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">Status</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">Assigned Driver</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">Created Date</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {shipments.map((shipment) => (
              <tr key={shipment.trackingNumber} className="transition duration-150 hover:bg-[#1F2937]">
                <td className="py-3 pr-6 font-semibold text-gray-50" style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)' }}>
                  {shipment.trackingNumber}
                </td>
                <td className="py-3 pr-6 text-sm text-gray-100">{shipment.receiver}</td>
                <td className="py-3 pr-6 text-sm text-gray-100">{shipment.city}</td>
                <td className="py-3 pr-6">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-white/[0.06] ${statusBadgeStyle(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="py-3 pr-6 text-sm text-gray-100">{shipment.assignedDriver}</td>
                <td className="py-3 pr-6 text-sm text-gray-100">{shipment.createdAt}</td>
                <td className="py-3 pr-6">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/shipments/${shipment.id ?? shipment.trackingNumber}`}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-gray-100 transition duration-150 hover:border-sky-400/40"
                    >
                      View Details
                    </Link>
                    <select
                      value={shipment.status}
                      disabled={updatingId === shipment.id}
                      onChange={(e) => handleStatusChange(shipment.id, e.target.value)}
                      className="rounded-[10px] border border-white/[0.08] bg-slate-800 px-2 py-1 text-sm text-gray-100 outline-none transition duration-150 focus:border-sky-400"
                    >
                      {SHIPMENT_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
