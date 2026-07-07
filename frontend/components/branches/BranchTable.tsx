"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Edit, Eye } from 'lucide-react'
import { deleteBranch } from '@/services/branch'
import { toast } from 'sonner'
import type { Branch } from '@/types/branch'

type Props = {
  branches: Branch[]
  onEdit: (branch: Branch) => void
  onDeleted?: () => void
}

export default function BranchTable({ branches, onEdit, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this branch?')) return
    setDeletingId(id)

    try {
      await deleteBranch(id)
      toast.success('Branch deleted')
      onDeleted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete branch')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Branches</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Branch list</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Name</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Code</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">City</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Manager</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Phone</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {branches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">No branches yet.</td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">{branch.name}</td>
                  <td className="py-5 pr-6">{branch.code}</td>
                  <td className="py-5 pr-6">{branch.city}</td>
                  <td className="py-5 pr-6">{branch.manager_name ?? '—'}</td>
                  <td className="py-5 pr-6">{branch.phone}</td>
                  <td className="py-5 pr-6">{branch.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="py-5 pr-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/dashboard/branches/${branch.id}`} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Eye className="h-4 w-4" /> View
                      </Link>
                      <button type="button" onClick={() => onEdit(branch)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(branch.id)} disabled={deletingId === branch.id} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
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
