"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { deleteShipment, fetchShipmentById, updateShipment } from '@/services/shipment'
import type { ShipmentCreatePayload, ShipmentResponse } from '@/types/shipment'
import StatusBadge from '@/components/shipments/StatusBadge'
import EditShipmentDialog from '@/components/shipments/EditShipmentDialog'
import DeleteConfirmationDialog from '@/components/shipments/DeleteConfirmationDialog'
import { toast } from 'sonner'

export default function ShipmentDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const shipmentId = Number(params?.id)
  const [shipment, setShipment] = useState<ShipmentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!shipmentId) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function loadShipment() {
      try {
        const result = await fetchShipmentById(shipmentId)
        if (isMounted) {
          setShipment(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load shipment details')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadShipment()

    return () => {
      isMounted = false
    }
  }, [shipmentId])

  const handleEditShipment = async (values: ShipmentCreatePayload) => {
    setIsEditSubmitting(true)
    setEditError(null)

    try {
      const updated = await updateShipment(shipmentId, values)
      setShipment(updated)
      setIsEditOpen(false)
      toast.success('Shipment updated successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update shipment.'
      setEditError(message)
      toast.error(message)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDeleteShipment = async () => {
    setIsDeleteSubmitting(true)
    setDeleteError(null)

    try {
      await deleteShipment(shipmentId)
      toast.success('Shipment deleted successfully')
      router.push('/dashboard/shipments')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete shipment.'
      setDeleteError(message)
      toast.error(message)
    } finally {
      setIsDeleteSubmitting(false)
      setIsDeleteOpen(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/dashboard/shipments" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to shipments
        </Link>

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading shipment…</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : shipment ? (
          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Shipment details</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">{shipment.receiver_name}</h1>
                <p className="mt-2 text-sm text-slate-400">Tracking: {shipment.tracking_number ?? `TRK-${shipment.id}`}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={shipment.status} />
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-[16px] bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400"
                >
                  Delete
                </button>
              </div>
            </div>

            {deleteError ? (
              <div className="mt-6 rounded-[16px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h2 className="text-lg font-semibold text-white">Shipment info</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Sender</dt><dd>{shipment.sender_name}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Receiver</dt><dd>{shipment.receiver_name}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Phone</dt><dd>{shipment.receiver_phone}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">City</dt><dd>{shipment.city}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">ETA</dt><dd>{shipment.estimated_delivery_days} days</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">COD</dt><dd>EGP {shipment.cod_amount ?? 0}</dd></div>
                </dl>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h2 className="text-lg font-semibold text-white">Delivery details</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Address</dt><dd className="text-right">{shipment.address}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd>{shipment.status}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Notes</dt><dd className="text-right">{shipment.notes || '—'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Created</dt><dd>{new Date(shipment.created_at).toLocaleString()}</dd></div>
                </dl>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <EditShipmentDialog 
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditShipment}
        isSubmitting={isEditSubmitting}
        submitError={editError}
        shipment={shipment}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteShipment}
        isSubmitting={isDeleteSubmitting}
        title="Delete shipment"
        description={`This will permanently remove shipment ${shipment?.tracking_number ?? `#${shipmentId}`}. This action cannot be undone.`}
      />
    </main>
  )
}
