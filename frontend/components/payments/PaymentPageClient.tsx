'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { usePaymentsQuery, useCreatePaymentMutation, useDeletePaymentMutation, useUpdatePaymentMutation } from '@/hooks/usePaymentQueries'
import type { Payment, PaymentCreatePayload } from '@/types/payment'
import PaymentTable from './PaymentTable'
import CreatePaymentDialog from './CreatePaymentDialog'

export default function PaymentPageClient() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Payment | null>(null)

  const { data: payments = [], isLoading, isError } = usePaymentsQuery(page, size, search)
  const createMutation = useCreatePaymentMutation()
  const updateMutation = useUpdatePaymentMutation()
  const deleteMutation = useDeletePaymentMutation()

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter
      const matchesSearch = !search || [payment.transaction_reference, payment.payment_method, payment.payment_status].some((value) => value?.toLowerCase().includes(search.toLowerCase()))
      return matchesStatus && matchesSearch
    })
  }, [payments, search, statusFilter])

  const summary = useMemo(() => ({
    total: filteredPayments.length,
    completed: filteredPayments.filter((payment) => payment.payment_status === 'Completed').length,
  }), [filteredPayments])

  const handleCreate = async (values: PaymentCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values })
        toast.success('Payment updated successfully')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Payment created successfully')
      }

      setIsCreateOpen(false)
      setEditing(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save payment.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this payment?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Payment deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete payment.')
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Payments</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage payments</h1>
          <p className="mt-2 text-sm text-slate-400">Track payment records and collections.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{summary.total} payments</div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New payment
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transactions"
          className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-800/80 px-4 text-sm text-white outline-none transition focus:border-sky-400 sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-12 rounded-[16px] border border-white/10 bg-slate-800/80 px-4 text-sm text-white outline-none transition focus:border-sky-400"
        >
          <option value="all">All statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading payments…</p>
        ) : isError ? (
          <p className="text-rose-400">Unable to load payments</p>
        ) : (
          <PaymentTable
            payments={filteredPayments}
            page={page}
            onPageChange={setPage}
            onEdit={(payment) => {
              setEditing(payment)
              setIsCreateOpen(true)
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreatePaymentDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          setEditing(null)
        }}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitError={submitError}
        editing={editing}
      />
    </>
  )
}
