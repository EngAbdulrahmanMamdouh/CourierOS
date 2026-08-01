'use client'

import { Edit, Trash } from 'lucide-react'
import type { Cod } from '@/types/cod'

type Props = {
  cods: Cod[]
  page: number
  onPageChange: (page: number) => void
  onEdit: (cod: Cod) => void
  onDelete: (id: number) => void
}

export default function CodTable({ cods, page, onPageChange, onEdit, onDelete }: Props) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">COD</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">COD list</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">COD ID</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Shipment</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Customer</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Amount</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Collected Amount</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Due Date</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {cods.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">No COD records yet.</td>
              </tr>
            ) : (
              cods.map((cod) => (
                <tr key={cod.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">#{cod.id}</td>
                  <td className="py-5 pr-6">{cod.shipment_id}</td>
                  <td className="py-5 pr-6">—</td>
                  <td className="py-5 pr-6">{cod.amount.toFixed(2)} {cod.currency}</td>
                  <td className="py-5 pr-6">{cod.collected ? cod.amount.toFixed(2) : '0.00'} {cod.currency}</td>
                  <td className="py-5 pr-6">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cod.collected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                      {cod.collected ? 'Collected' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-5 pr-6">{cod.collected_at ? new Date(cod.collected_at).toLocaleDateString() : '—'}</td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onEdit(cod)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => onDelete(cod.id)} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
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

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">Page {page}</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-[12px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <button type="button" onClick={() => onPageChange(page + 1)} className="rounded-[12px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200">
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
