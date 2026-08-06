"use client"

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ShipmentForm from '@/components/shipments/ShipmentForm'
import type { ShipmentCreatePayload, ShipmentResponse } from '@/types/shipment'

type EditShipmentDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: ShipmentCreatePayload) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
  shipment: ShipmentResponse | null
}

export default function EditShipmentDialog({ open, onClose, onSubmit, isSubmitting, submitError, shipment }: EditShipmentDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !shipment) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div ref={dialogRef} className={`w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/70 transition-all ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('shipments.edit_title')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t('shipments.edit_title')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200 transition hover:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

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
            notes: shipment.notes || '',
            cod_amount: shipment.cod_amount || 0,
          }}
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
          submitError={submitError} 
          onCancel={onClose} 
          submitLabel={t('shipments.button.save_changes')}
        />
      </div>
    </div>
  )
}
