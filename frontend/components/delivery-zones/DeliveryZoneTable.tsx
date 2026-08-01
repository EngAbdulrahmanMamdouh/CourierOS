"use client"

import { Pencil, Trash2 } from 'lucide-react'
import type { DeliveryZone } from '@/types/deliveryZone'

type Props = {
  deliveryZones: DeliveryZone[]
  onEdit: (deliveryZone: DeliveryZone) => void
  onDelete: (deliveryZone: DeliveryZone) => void
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
}

export default function DeliveryZoneTable({ deliveryZones, onEdit, onDelete, isLoading, isError, errorMessage }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-400">
        Loading delivery zones…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-sm text-rose-300">
        {errorMessage || 'Unable to load delivery zones right now.'}
      </div>
    )
  }

  if (!deliveryZones.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-400">
        No delivery zones match your current search.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/40">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-white/10 bg-slate-950/40 text-xs uppercase tracking-[0.25em] text-slate-400">
            <tr>
              <th className="px-4 py-4">Zone Name</th>
              <th className="px-4 py-4">City</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Created At</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveryZones.map((zone) => (
              <tr key={zone.id} className="border-b border-white/10 last:border-b-0">
                <td className="px-4 py-4">
                  <div className="font-semibold text-white">{zone.zone_name}</div>
                  <div className="mt-1 text-xs text-slate-500">Extra cost: EGP {Number(zone.extra_cost).toFixed(2)}</div>
                </td>
                <td className="px-4 py-4">{zone.city_id}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${zone.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/70 text-slate-300'}`}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-4">{new Date(zone.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(zone)} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-slate-800/70 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={() => onDelete(zone)} className="inline-flex items-center gap-2 rounded-[12px] bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
