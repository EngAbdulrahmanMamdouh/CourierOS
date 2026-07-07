"use client"

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { fetchBranchById, deleteBranch } from '@/services/branch'

type Props = {
  branchId: number
}

export default function BranchDetailPageClient({ branchId }: Props) {
  const router = useRouter()

  const { data: branch, isLoading, isError } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => fetchBranchById(branchId),
    enabled: Boolean(branchId),
  })

  const handleDelete = async () => {
    if (!confirm('Delete this branch?')) return

    try {
      await deleteBranch(branchId)
      toast.success('Branch deleted')
      router.push('/dashboard/branches')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete branch.'
      toast.error(message)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading branch…</p>
  }

  if (isError || !branch) {
    return <p className="text-rose-400">Branch not found</p>
  }

  return (
    <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Branch detail</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{branch.name}</h1>
        </div>
        <button type="button" onClick={handleDelete} className="rounded-[16px] bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400">
          Delete branch
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-6">
          <h2 className="text-base font-semibold text-slate-100">Details</h2>
          <p className="mt-4 text-sm text-slate-300"><span className="font-semibold text-slate-200">Code:</span> {branch.code}</p>
          <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-slate-200">Address:</span> {branch.address}</p>
          <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-slate-200">City:</span> {branch.city}</p>
          <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-slate-200">Manager:</span> {branch.manager_name ?? '—'}</p>
          <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-slate-200">Status:</span> {branch.is_active ? 'Active' : 'Inactive'}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-6">
          <h2 className="text-base font-semibold text-slate-100">Contact</h2>
          <p className="mt-4 text-sm text-slate-300"><span className="font-semibold text-slate-200">Phone:</span> {branch.phone}</p>
          <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-slate-200">Created:</span> {new Date(branch.created_at).toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-slate-200">Updated:</span> {new Date(branch.updated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
