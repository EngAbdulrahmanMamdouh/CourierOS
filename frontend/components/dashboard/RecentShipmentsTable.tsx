"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SHIPMENT_STATUS_OPTIONS } from '@/constants/shipment'
import { updateShipmentStatus } from '@/services/shipment'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDateValue, getLocaleFromLanguage } from '@/utils/locale'

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
  const { t, i18n } = useTranslation()
  const locale = getLocaleFromLanguage(i18n.language)

  const handleStatusChange = async (shipmentId: number | undefined, nextStatus: string) => {
    if (!shipmentId || !nextStatus) return
    setUpdatingId(shipmentId)
    try {
      await updateShipmentStatus(shipmentId, nextStatus as any)
      toast.success(t('dashboard.shipments.status_updated'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dashboard.shipments.unable_update_status'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="rounded-[16px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-150 hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{t('dashboard.recent_shipments')}</p>
          <h2 className="mt-2 text-[20px] font-semibold text-gray-50">{t('dashboard.latest_movement')}</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[12px] border border-white/[0.08] bg-slate-900/70 px-4 py-2 text-sm font-semibold text-gray-100 transition duration-150 hover:border-sky-400/40 hover:bg-slate-900">
          {t('dashboard.view_all_shipments')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-100">
          <thead>
            <tr className="border-b border-white/[0.05] text-gray-400">
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.tracking_number')}</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.receiver')}</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.city')}</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.status')}</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.assigned_driver')}</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.created_date')}</th>
              <th className="py-3 pr-6 text-[12px] uppercase tracking-[0.08em]">{t('dashboard.table.actions')}</th>
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
                <td className="py-3 pr-6 text-sm text-gray-100">{formatDateValue(shipment.createdAt, locale, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td className="py-3 pr-6">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/shipments/${shipment.id ?? shipment.trackingNumber}`}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-gray-100 transition duration-150 hover:border-sky-400/40"
                    >
                      {t('dashboard.table.view_details')}
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
