"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { fetchShipmentById, updateShipment } from '@/services/shipment'
import type { ShipmentResponse, ShipmentCreatePayload } from '@/types/shipment'
import ShipmentForm from '@/components/shipments/ShipmentForm'

export default function ShipmentEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const shipmentId = Number(params?.id)
  const [shipment, setShipment] = useState<ShipmentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { t } = useTranslation()

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
          setError(err instanceof Error ? err.message : t('shipments.load_failed'))
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

  const handleSubmit = async (values: ShipmentCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await updateShipment(shipmentId, values)
      toast.success(t('shipments.updated_success'))
      router.push(`/shipments/${shipmentId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('shipments.update_failed')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href={`/shipments/${shipmentId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          {t('shipments.back_to_details')}
        </Link>

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">{t('shipments.loading')}</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : shipment ? (
          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
            <div className="border-b border-white/10 pb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('shipments.edit_title')}</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{shipment.receiver_name}</h1>
              <p className="mt-2 text-sm text-slate-400">{t('shipments.tracking', { tracking: shipment.tracking_number ?? `TRK-${shipment.id}` })}</p>
            </div>

            <div className="mt-8">
              <ShipmentForm
                mode="edit"
                defaultValues={{
                  sender_name: shipment.sender_name,
                  receiver_name: shipment.receiver_name,
                  receiver_phone: shipment.receiver_phone,
                  address: shipment.address,
                  city: shipment.city,
                  status: shipment.status,
                  estimated_delivery_days: shipment.estimated_delivery_days,
                  notes: shipment.notes ?? '',
                  cod_amount: shipment.cod_amount ?? 0,
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onCancel={handleCancel}
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
