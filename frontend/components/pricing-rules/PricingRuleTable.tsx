"use client"

import { Pencil, Trash2 } from 'lucide-react'
import type { PricingRule } from '@/types/pricingRule'

type Props = {
  pricingRules: PricingRule[]
  onEdit: (pricingRule: PricingRule) => void
  onDelete: (pricingRule: PricingRule) => void
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
}

export default function PricingRuleTable({ pricingRules, onEdit, onDelete, isLoading, isError, errorMessage }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-400">
        Loading pricing rules…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-sm text-rose-300">
        {errorMessage || 'Unable to load pricing rules right now.'}
      </div>
    )
  }

  if (!pricingRules.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-400">
        No pricing rules match your current search.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/40">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="border-b border-white/10 bg-slate-950/40 text-xs uppercase tracking-[0.25em] text-slate-400">
            <tr>
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Route</th>
              <th className="px-4 py-4">Service</th>
              <th className="px-4 py-4">Weight</th>
              <th className="px-4 py-4">Base</th>
              <th className="px-4 py-4">Extra</th>
              <th className="px-4 py-4">ETA</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pricingRules.map((rule) => (
              <tr key={rule.id} className="border-b border-white/10 last:border-b-0">
                <td className="px-4 py-4 font-semibold text-white">#{rule.id}</td>
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-100">{rule.source_city_id} → {rule.destination_city_id}</div>
                  <div className="mt-1 text-xs text-slate-500">Zone: {rule.delivery_zone_id ?? '—'}</div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                    {rule.service_type}
                  </span>
                </td>
                <td className="px-4 py-4">{rule.min_weight}–{rule.max_weight} kg</td>
                <td className="px-4 py-4">EGP {Number(rule.base_price).toFixed(2)}</td>
                <td className="px-4 py-4">EGP {Number(rule.extra_cost).toFixed(2)}</td>
                <td className="px-4 py-4">{rule.estimated_delivery_days} days</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/70 text-slate-300'}`}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(rule)} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-slate-800/70 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={() => onDelete(rule)} className="inline-flex items-center gap-2 rounded-[12px] bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25">
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
