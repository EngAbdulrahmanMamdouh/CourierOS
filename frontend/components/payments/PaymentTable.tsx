'use client'

import { Edit, Trash } from 'lucide-react'
import type { Payment } from '@/types/payment'

type Props = {
  payments: Payment[]
  page: number
  onPageChange: (page: number) => void
  onEdit: (payment: Payment) => void
  onDelete: (id: number) => void
}

export default function PaymentTable({ payments, page, onPageChange, onEdit, onDelete }: Props) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Payments</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Payment list</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Payment ID</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Shipment</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Company</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Amount</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Method</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Date</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">No payments yet.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">#{payment.id}</td>
                  <td className="py-5 pr-6">{payment.shipment_id ?? '—'}</td>
                  <td className="py-5 pr-6">{payment.company_id ?? '—'}</td>
                  <td className="py-5 pr-6">{payment.amount.toFixed(2)} {payment.currency}</td>
                  <td className="py-5 pr-6">{payment.payment_method}</td>
                  <td className="py-5 pr-6">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${payment.payment_status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300' : payment.payment_status === 'Pending' ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'}`}>
                      {payment.payment_status}
                    </span>
                  </td>
                  <td className="py-5 pr-6">{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '—'}</td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onEdit(payment)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => onDelete(payment.id)} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
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
