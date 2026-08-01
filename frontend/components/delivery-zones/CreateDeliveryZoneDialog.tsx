"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { DeliveryZone } from '@/types/deliveryZone'

const schema = z.object({
  city_id: z.string().trim().min(1, 'City is required'),
  zone_name: z.string().trim().min(2, 'Zone name is required'),
  delivery_days: z.string().trim().min(1, 'Delivery days are required'),
  extra_cost: z.string().trim().min(1, 'Extra cost is required'),
  is_active: z.string().trim().min(1, 'Status is required'),
})

type Form = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editingZone?: DeliveryZone | null
}

export default function CreateDeliveryZoneDialog({ open, onClose, onSubmit, isSubmitting, submitError, editingZone }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    city_id: editingZone?.city_id?.toString() ?? '',
    zone_name: editingZone?.zone_name ?? '',
    delivery_days: editingZone?.delivery_days ?? '',
    extra_cost: editingZone?.extra_cost?.toString() ?? '',
    is_active: editingZone?.is_active ? 'true' : 'false',
  }), [editingZone])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, defaultValues, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div ref={dialogRef} className={`w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{editingZone ? 'Update delivery zone' : 'Create delivery zone'}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{editingZone ? 'Edit delivery zone' : 'New delivery zone'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">City ID</label>
              <input {...register('city_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Example: 1" />
              {errors.city_id ? <p className="mt-2 text-sm text-rose-400">{errors.city_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Zone Name</label>
              <input {...register('zone_name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Central Cairo" />
              {errors.zone_name ? <p className="mt-2 text-sm text-rose-400">{errors.zone_name.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Delivery Days</label>
              <input {...register('delivery_days')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Mon-Wed-Fri" />
              {errors.delivery_days ? <p className="mt-2 text-sm text-rose-400">{errors.delivery_days.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Extra Cost</label>
              <input {...register('extra_cost')} type="number" step="0.01" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="0" />
              {errors.extra_cost ? <p className="mt-2 text-sm text-rose-400">{errors.extra_cost.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Status</label>
              <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving…' : editingZone ? 'Save changes' : 'Create zone'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
