"use client"

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ShipmentCreatePayload } from '@/types/shipment'
import { SHIPMENT_STATUS_OPTIONS } from '@/constants/shipment'

const shipmentFormSchema = z.object({
  sender_name: z.string().trim().min(2, 'Sender name is required').max(100),
  receiver_name: z.string().trim().min(2, 'Receiver name is required').max(100),
  receiver_phone: z.string().trim().regex(/^\d{11}$/, 'Receiver phone must be 11 digits'),
  address: z.string().trim().min(5, 'Address is required').max(255),
  city: z.string().trim().min(2, 'City is required').max(100),
  status: z.enum(['Pending', 'In Transit', 'Delivered', 'Cancelled']),
  estimated_delivery_days: z.coerce.number().int().min(1).max(365),
  notes: z.string().max(1000).default(''),
  cod_amount: z.coerce.number().min(0).default(0),
})

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>

type ShipmentFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<ShipmentFormValues>
  onSubmit: (values: ShipmentCreatePayload) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  submitError?: string | null
  onCancel?: () => void
  initialFocusRef?: React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
}

export default function ShipmentForm({
  mode,
  defaultValues,
  onSubmit,
  submitLabel = mode === 'edit' ? 'Save changes' : 'Create shipment',
  isSubmitting = false,
  submitError = null,
  onCancel,
  initialFocusRef,
}: ShipmentFormProps) {
  const firstInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted, touchedFields },
    setFocus,
  } = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      sender_name: '',
      receiver_name: '',
      receiver_phone: '',
      address: '',
      city: '',
      status: 'Pending',
      estimated_delivery_days: 1,
      notes: '',
      cod_amount: 0,
      ...defaultValues,
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!defaultValues) {
      reset({
        sender_name: '',
        receiver_name: '',
        receiver_phone: '',
        address: '',
        city: '',
        status: 'Pending',
        estimated_delivery_days: 1,
        notes: '',
        cod_amount: 0,
      })
    }
  }, [defaultValues, reset])

  useEffect(() => {
    if (initialFocusRef?.current) {
      setFocus('sender_name')
      initialFocusRef.current.focus()
    } else {
      firstInputRef.current?.focus()
    }
  }, [initialFocusRef, setFocus])

  useEffect(() => {
    if (!isSubmitted || Object.keys(errors).length === 0) {
      return
    }

    const firstErrorField = Object.keys(errors)[0] as keyof ShipmentFormValues
    setFocus(firstErrorField)
  }, [errors, isSubmitted, setFocus])

  const showFieldError = (field: keyof ShipmentFormValues) => Boolean(errors[field] && (touchedFields[field] || isSubmitted))

  const submitHandler = async (values: ShipmentFormValues) => {
    await onSubmit({ ...values, cod_amount: Number(values.cod_amount ?? 0) })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitHandler)}>
      {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Sender name</label>
          <input
            {...register('sender_name')}
            ref={(element) => {
              firstInputRef.current = element
              const registration = register('sender_name')
              registration.ref(element)
            }}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
            placeholder="Sender name"
          />
          {showFieldError('sender_name') ? <p className="mt-2 text-sm text-rose-400">{errors.sender_name?.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Receiver name</label>
          <input
            {...register('receiver_name')}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
            placeholder="Receiver name"
          />
          {showFieldError('receiver_name') ? <p className="mt-2 text-sm text-rose-400">{errors.receiver_name?.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Receiver phone</label>
          <input
            {...register('receiver_phone')}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
            placeholder="01000000000"
          />
          {showFieldError('receiver_phone') ? <p className="mt-2 text-sm text-rose-400">{errors.receiver_phone?.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">City</label>
          <input
            {...register('city')}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
            placeholder="City"
          />
          {showFieldError('city') ? <p className="mt-2 text-sm text-rose-400">{errors.city?.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">Address</label>
        <textarea
          {...register('address')}
          rows={3}
          className="w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
          placeholder="Full delivery address"
        />
        {showFieldError('address') ? <p className="mt-2 text-sm text-rose-400">{errors.address?.message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Status</label>
          <select
            {...register('status')}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
          >
            {SHIPMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">ETA days</label>
          <input
            type="number"
            min={1}
            max={365}
            {...register('estimated_delivery_days', { valueAsNumber: true })}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
          />
          {showFieldError('estimated_delivery_days') ? <p className="mt-2 text-sm text-rose-400">{errors.estimated_delivery_days?.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">COD amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            {...register('cod_amount', { valueAsNumber: true })}
            className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
          />
          {showFieldError('cod_amount') ? <p className="mt-2 text-sm text-rose-400">{errors.cod_amount?.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
          placeholder="Optional notes"
        />
        {showFieldError('notes') ? <p className="mt-2 text-sm text-rose-400">{errors.notes?.message}</p> : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (mode === 'edit' ? 'Saving…' : 'Creating…') : submitLabel}
        </button>
      </div>
    </form>
  )
}
