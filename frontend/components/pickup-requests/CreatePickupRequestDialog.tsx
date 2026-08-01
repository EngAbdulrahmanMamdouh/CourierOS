"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { PickupRequest, PickupRequestCreatePayload } from '@/types/pickupRequest'

type Form = PickupRequestCreatePayload

const schema = z.object({
  customer_id: z.preprocess((value) => Number(value), z.number().min(1, 'Customer is required')),
  pickup_address: z.string().trim().min(5, 'Address must be at least 5 characters'),
  city_id: z.preprocess((value) => Number(value), z.number().min(1, 'City is required')),
  contact_name: z.string().trim().min(2, 'Contact name is required'),
  contact_phone: z.string().trim().min(11, 'Contact phone is required'),
  preferred_pickup_date: z.string().min(1, 'Preferred pickup date is required'),
  preferred_time_window: z.string().trim().min(3, 'Preferred time window is required'),
  notes: z.string().optional().or(z.literal('')).transform((value) => (value === '' ? null : value)),
  assigned_branch_id: z.preprocess((value) => (value === '' || value === undefined || value === null ? null : Number(value)), z.number().nullable().optional()),
  assigned_driver_id: z.preprocess((value) => (value === '' || value === undefined || value === null ? null : Number(value)), z.number().nullable().optional()),
})

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editing?: Partial<PickupRequest> | null
}

export default function CreatePickupRequestDialog({ open, onClose, onSubmit, isSubmitting, submitError, editing }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    customer_id: 1,
    pickup_address: '',
    city_id: 1,
    contact_name: '',
    contact_phone: '',
    preferred_pickup_date: '',
    preferred_time_window: '',
    notes: null,
    assigned_branch_id: null,
    assigned_driver_id: null,
  }), [])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  useEffect(() => {
    reset(editing ? { ...defaultValues, ...editing } : defaultValues)
  }, [editing, reset, defaultValues])

  useEffect(() => {
    if (!open) return

    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.scrollTo({ top: dialogRef.current.scrollHeight, behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center py-2">
        <div ref={dialogRef} className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Create pickup request</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">New pickup request</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Customer ID</label>
                <input {...register('customer_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="1" />
                {errors.customer_id ? <p className="mt-2 text-sm text-rose-400">{errors.customer_id.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">City ID</label>
                <input {...register('city_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="1" />
                {errors.city_id ? <p className="mt-2 text-sm text-rose-400">{errors.city_id.message}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Pickup address</label>
              <input {...register('pickup_address')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="123 Main Street" />
              {errors.pickup_address ? <p className="mt-2 text-sm text-rose-400">{errors.pickup_address.message}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Contact name</label>
                <input {...register('contact_name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Jane Doe" />
                {errors.contact_name ? <p className="mt-2 text-sm text-rose-400">{errors.contact_name.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Contact phone</label>
                <input {...register('contact_phone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="01000000000" />
                {errors.contact_phone ? <p className="mt-2 text-sm text-rose-400">{errors.contact_phone.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Preferred pickup date</label>
                <input {...register('preferred_pickup_date')} type="datetime-local" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                {errors.preferred_pickup_date ? <p className="mt-2 text-sm text-rose-400">{errors.preferred_pickup_date.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Preferred time window</label>
                <input {...register('preferred_time_window')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Morning" />
                {errors.preferred_time_window ? <p className="mt-2 text-sm text-rose-400">{errors.preferred_time_window.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Assigned branch ID</label>
                <input {...register('assigned_branch_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Optional" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Assigned driver ID</label>
                <input {...register('assigned_driver_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Notes</label>
              <input {...register('notes')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Optional note" />
            </div>

            {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

            <div className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-white/10 bg-slate-900/95 px-6 pb-2 pt-5 sm:flex sm:justify-end">
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Saving…' : 'Save request'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
