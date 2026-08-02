'use client'

import { Edit, Trash } from 'lucide-react'
import type { City } from '@/types/city'

type Props = {
  cities: City[]
  isLoading: boolean
  isError: boolean
  errorMessage: string
  onEdit: (city: City) => void
  onDelete: (city: City) => void
}

export default function CityTable({ cities, isLoading, isError, errorMessage, onEdit, onDelete }: Props) {
  if (isLoading) {
    return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">Loading cities…</div>
  }

  if (isError) {
    return <div className="rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-300">{errorMessage}</div>
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Cities</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">City list</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Name</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Code</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Governorate</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {cities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">No cities yet.</td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">{city.name}</td>
                  <td className="py-5 pr-6">{city.code}</td>
                  <td className="py-5 pr-6">{city.governorate}</td>
                  <td className="py-5 pr-6">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${city.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                      {city.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onEdit(city)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => onDelete(city)} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
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
