"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Trash, Edit, Eye } from 'lucide-react'
import { deleteDriver } from '@/services/driver'
import type { DriverResponse } from '@/types/driver'
import { toast } from 'sonner'

type Props = {
  drivers: DriverResponse[]
  onEdit: (driver: DriverResponse) => void
  onDeleted?: () => void
}

export default function DriverTable({ drivers, onEdit, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number | string | null | undefined) => {
    if (!confirm('Delete this driver?')) return

    const driverId = Number(id)
    if (!Number.isInteger(driverId) || driverId <= 0) {
      toast.error('Invalid driver selection')
      return
    }

    setDeletingId(driverId)

    try {
      await deleteDriver(driverId)
      toast.success('Driver deleted')
      onDeleted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete driver')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Drivers</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Driver list</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Name</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Phone</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Branch</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Vehicle</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Deliveries</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">No drivers yet.</td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">{driver.full_name}</td>
                  <td className="py-5 pr-6">{driver.phone}</td>
                  <td className="py-5 pr-6">{driver.branch_name ?? '—'}</td>
                  <td className="py-5 pr-6">{driver.vehicle_type} / {driver.vehicle_plate}</td>
                  <td className="py-5 pr-6">{driver.status}</td>
                  <td className="py-5 pr-6">
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>{driver.assigned_shipments_count} assigned</div>
                      <div>{driver.pending_deliveries_count} pending</div>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/dashboard/drivers/${driver.id}`} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Eye className="h-4 w-4" /> View
                      </Link>
                      <button type="button" onClick={() => onEdit(driver)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(driver.id)} disabled={deletingId === driver.id} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
                        <Trash className="h-4 w-4" /> Delete
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
