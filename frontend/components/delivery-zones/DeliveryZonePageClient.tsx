'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCreateDeliveryZoneMutation, useDeleteDeliveryZoneMutation, useDeliveryZonesQuery, useUpdateDeliveryZoneMutation } from '@/hooks/useDeliveryZoneQueries'
import type { DeliveryZone, DeliveryZoneCreatePayload } from '@/types/deliveryZone'
import CreateDeliveryZoneDialog from './CreateDeliveryZoneDialog'
import DeliveryZoneTable from './DeliveryZoneTable'

const PAGE_SIZE = 10

export default function DeliveryZonePageClient() {
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const { data: deliveryZones = [], isLoading, isError, error } = useDeliveryZonesQuery(page, PAGE_SIZE, appliedSearch)
  const createMutation = useCreateDeliveryZoneMutation()
  const updateMutation = useUpdateDeliveryZoneMutation()
  const deleteMutation = useDeleteDeliveryZoneMutation()

  const summary = useMemo(() => ({
    total: deliveryZones.length,
    active: deliveryZones.filter((zone) => zone.is_active).length,
  }), [deliveryZones])

  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setPage(1)
    setAppliedSearch('')
  }

  const handleSubmit = async (values: { [key: string]: string }) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: DeliveryZoneCreatePayload = {
        city_id: Number(values.city_id),
        zone_name: values.zone_name,
        delivery_days: values.delivery_days,
        extra_cost: Number(values.extra_cost),
        is_active: values.is_active === 'true',
      }

      if (editingZone) {
        await updateMutation.mutateAsync({ id: editingZone.id, payload })
        toast.success('Delivery zone updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Delivery zone created successfully')
      }

      setIsCreateOpen(false)
      setEditingZone(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save delivery zone.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (deliveryZone: DeliveryZone) => {
    if (!window.confirm('Delete this delivery zone?')) return

    try {
      await deleteMutation.mutateAsync(deliveryZone.id)
      toast.success('Delivery zone deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete delivery zone.')
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Delivery zones</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage delivery zones</h1>
          <p className="mt-2 text-sm text-slate-400">Define delivery coverage areas for your shipping network.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
            {summary.total} zones • {summary.active} active
          </div>
          <button type="button" onClick={() => { setEditingZone(null); setIsCreateOpen(true) }} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New zone
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Search delivery zones"
            className="h-12 flex-1 rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSearch} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">Search</button>
            {(appliedSearch || searchInput) ? (
              <button type="button" onClick={handleClearSearch} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Clear</button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100">
            Page {page}
          </div>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={deliveryZones.length < PAGE_SIZE} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DeliveryZoneTable
          deliveryZones={deliveryZones}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : 'Unable to load delivery zones right now.'}
          onEdit={(zone) => { setEditingZone(zone); setIsCreateOpen(true) }}
          onDelete={handleDelete}
        />
      </div>

      <CreateDeliveryZoneDialog
        open={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setEditingZone(null) }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        editingZone={editingZone}
      />
    </>
  )
}
