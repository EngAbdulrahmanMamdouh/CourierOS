"use client"

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createShipment, fetchShipments } from '@/services/shipment'
import type { ShipmentCreatePayload } from '@/types/shipment'
import ShipmentTable from '@/components/shipments/ShipmentTable'
import CreateShipmentDialog from '@/components/shipments/CreateShipmentDialog'
import ImportExcelDialog from '@/components/shipments/ImportExcelDialog'

export default function ShipmentPageClient() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: shipments = [], isLoading, isError } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
  })

  const summary = useMemo(() => ({
    total: shipments.length,
    pending: shipments.filter((shipment) => shipment.status === 'Pending').length,
  }), [shipments])

  const handleCreateShipment = async (values: ShipmentCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const createdShipment = await createShipment(values)
      await queryClient.invalidateQueries({ queryKey: ['shipments'] })
      toast.success(`Shipment created successfully. Shipping Price: ${createdShipment.shipping_price != null ? `EGP ${Number(createdShipment.shipping_price).toFixed(2)}` : 'EGP —'}`)
      setIsCreateOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create shipment.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImportSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['shipments'] })
    toast.success('Shipments imported successfully')
    setIsImportOpen(false)
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Shipment Operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage shipments</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Track dispatches, monitor COD, and review delivery progress in one workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
            {summary.total} shipments • {summary.pending} pending
          </div>
          <button type="button" onClick={() => setIsImportOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Import Excel
          </button>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New shipment
          </button>
        </div>
      </div>

      {isError ? <p className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">Unable to load shipments right now.</p> : null}

      {isLoading ? <p className="text-sm text-slate-400">Loading shipments…</p> : <ShipmentTable shipments={shipments} onCreateClick={() => setIsCreateOpen(true)} onStatusUpdated={() => queryClient.invalidateQueries({ queryKey: ['shipments'] })} />}

      <CreateShipmentDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateShipment} isSubmitting={isSubmitting} submitError={submitError} />
      <ImportExcelDialog open={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={handleImportSuccess} />
    </>
  )
}
