"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Edit, Eye } from 'lucide-react'
import { deleteCustomer } from '@/services/customer'
import { toast } from 'sonner'

type Customer = {
  id: number
  full_name: string
  phone: string
  email?: string
  city: string
  address?: string
  created_at: string
}

type Props = {
  customers: Customer[]
  onEdit: (c: Customer) => void
  onDeleted?: () => void
}

export default function CustomerTable({ customers, onEdit, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return
    setDeletingId(id)
    try {
      await deleteCustomer(id)
      toast.success('Customer deleted')
      onDeleted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete customer')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Customers</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Customer list</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Name</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Phone</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Email</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">City</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Created At</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No customers yet.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">{c.full_name}</td>
                  <td className="py-5 pr-6">{c.phone}</td>
                  <td className="py-5 pr-6">{c.email ?? '—'}</td>
                  <td className="py-5 pr-6">{c.city}</td>
                  <td className="py-5 pr-6">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/customers/${c.id}`} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100"> <Eye className="h-4 w-4"/> View</Link>
                      <button onClick={() => onEdit(c)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100"> <Edit className="h-4 w-4"/> Edit</button>
                      <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300"> <Trash className="h-4 w-4"/> Delete</button>
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
