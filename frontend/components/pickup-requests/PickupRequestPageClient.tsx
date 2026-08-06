'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreatePickupRequestMutation, useDeletePickupRequestMutation, usePickupRequestsQuery, useUpdatePickupRequestMutation } from '@/hooks/usePickupRequestQueries'
import type { PickupRequest, PickupRequestCreatePayload } from '@/types/pickupRequest'
import PickupRequestTable from './PickupRequestTable'
import CreatePickupRequestDialog from './CreatePickupRequestDialog'

export default function PickupRequestPageClient() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState<PickupRequest | null>(null)

  const { data: pickupRequests = [], isLoading, isError } = usePickupRequestsQuery(page, size, search)
  const createMutation = useCreatePickupRequestMutation()
  const updateMutation = useUpdatePickupRequestMutation()
  const deleteMutation = useDeletePickupRequestMutation()

  const filteredPickupRequests = useMemo(() => {
    return pickupRequests.filter((request) => {
      const statusValue = (request.status ?? '').toLowerCase()
      const matchesStatus = statusFilter === 'all' || statusValue === statusFilter.toLowerCase()
      const matchesSearch = !search || [request.pickup_address, request.contact_name, request.contact_phone, request.status].some((value) => (value ?? '').toLowerCase().includes(search.toLowerCase()))
      return matchesStatus && matchesSearch
    })
  }, [pickupRequests, search, statusFilter])

  const summary = useMemo(() => ({
    total: filteredPickupRequests.length,
    pending: filteredPickupRequests.filter((request) => (request.status ?? '').toLowerCase() === 'pending').length,
  }), [filteredPickupRequests])

  const handleCreate = async (values: PickupRequestCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values })
        toast.success(t('pickupRequests.toast.updated'))
      } else {
        await createMutation.mutateAsync(values)
        toast.success(t('pickupRequests.toast.created'))
      }

      setIsCreateOpen(false)
      setEditing(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('pickupRequests.toast.save_failed')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this pickup request?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success(t('pickupRequests.toast.deleted'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('pickupRequests.toast.delete_failed'))
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('pickupRequests.page.title')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('pickupRequests.page.manage')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('pickupRequests.page.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{t('pickupRequests.page.summary', { total: summary.total })}</div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            {t('pickupRequests.page.new_request')}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search pickup requests"
          className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-800/80 px-4 text-sm text-white outline-none transition focus:border-sky-400 sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-12 rounded-[16px] border border-white/10 bg-slate-800/80 px-4 text-sm text-white outline-none transition focus:border-sky-400"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="assigned">Assigned</option>
          <option value="picked_up">Picked up</option>
          <option value="converted_to_shipment">Converted to shipment</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">{t('pickupRequests.page.loading')}</p>
        ) : isError ? (
          <p className="text-rose-400">{t('pickupRequests.page.load_failed')}</p>
        ) : (
          <PickupRequestTable
            pickupRequests={filteredPickupRequests}
            page={page}
            onPageChange={setPage}
            onEdit={(request) => {
              setEditing(request)
              setIsCreateOpen(true)
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreatePickupRequestDialog
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
