"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Trash, Edit, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { deleteDriver } from '@/services/driver'
import type { DriverResponse } from '@/types/driver'
import { toast } from 'sonner'

type Props = {
  drivers: DriverResponse[]
  onEdit: (driver: DriverResponse) => void
  onDeleted?: () => void
}

export default function DriverTable({ drivers, onEdit, onDeleted }: Props) {
  const { t } = useTranslation()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number | string | null | undefined) => {
    if (!window.confirm(t('drivers.confirm_delete'))) return

    const driverId = Number(id)
    if (!Number.isInteger(driverId) || driverId <= 0) {
      toast.error(t('drivers.invalid_selection'))
      return
    }

    setDeletingId(driverId)

    try {
      await deleteDriver(driverId)
      toast.success(t('drivers.deleted_success'))
      onDeleted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('drivers.delete_failed'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('drivers.page.title')}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{t('drivers.list_title')}</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.name')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.phone')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.branch')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.vehicle')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.status')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.deliveries')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('drivers.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">{t('drivers.no_drivers')}</td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">{driver.full_name}</td>
                  <td className="py-5 pr-6">{driver.phone}</td>
                  <td className="py-5 pr-6">{driver.branch_name ?? '—'}</td>
                  <td className="py-5 pr-6">{driver.vehicle_type} / {driver.vehicle_plate}</td>
                  <td className="py-5 pr-6">{driver.status === 'inactive' ? t('drivers.option.status.inactive') : t('drivers.option.status.active')}</td>
                  <td className="py-5 pr-6">
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>{t('drivers.table.assigned_count', { count: driver.assigned_shipments_count })}</div>
                      <div>{t('drivers.table.pending_count', { count: driver.pending_deliveries_count })}</div>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/dashboard/drivers/${driver.id}`} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Eye className="h-4 w-4" /> {t('drivers.view')}
                      </Link>
                      <button type="button" onClick={() => onEdit(driver)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> {t('drivers.edit')}
                      </button>
                      <button type="button" onClick={() => handleDelete(driver.id)} disabled={deletingId === driver.id} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
                        <Trash className="h-4 w-4" /> {t('drivers.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
