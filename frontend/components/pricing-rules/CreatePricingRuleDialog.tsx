"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { PricingRule } from '@/types/pricingRule'

const schema = z.object({
  source_city_id: z.string().trim().min(1, 'Source city is required'),
  destination_city_id: z.string().trim().min(1, 'Destination city is required'),
  delivery_zone_id: z.string().trim().optional(),
  service_type: z.string().trim().min(2, 'Service type is required'),
  min_weight: z.string().trim().min(1, 'Minimum weight is required'),
  max_weight: z.string().trim().min(1, 'Maximum weight is required'),
  base_price: z.string().trim().min(1, 'Base price is required'),
  extra_cost: z.string().trim().min(1, 'Extra cost is required'),
  estimated_delivery_days: z.string().trim().min(1, 'Estimated delivery days are required'),
  is_active: z.string().trim().min(1, 'Status is required'),
})

type Form = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editingRule?: PricingRule | null
}

export default function CreatePricingRuleDialog({ open, onClose, onSubmit, isSubmitting, submitError, editingRule }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    source_city_id: editingRule?.source_city_id?.toString() ?? '',
    destination_city_id: editingRule?.destination_city_id?.toString() ?? '',
    delivery_zone_id: editingRule?.delivery_zone_id?.toString() ?? '',
    service_type: editingRule?.service_type ?? '',
    min_weight: editingRule?.min_weight?.toString() ?? '',
    max_weight: editingRule?.max_weight?.toString() ?? '',
    base_price: editingRule?.base_price?.toString() ?? '',
    extra_cost: editingRule?.extra_cost?.toString() ?? '',
    estimated_delivery_days: editingRule?.estimated_delivery_days?.toString() ?? '',
    is_active: editingRule?.is_active ? 'true' : 'false',
  }), [editingRule])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, defaultValues, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div ref={dialogRef} className={`w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{editingRule ? 'Update pricing rule' : 'Create pricing rule'}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{editingRule ? 'Edit rule' : 'New rule'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Source City ID</label>
              <input {...register('source_city_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Example: 1" />
              {errors.source_city_id ? <p className="mt-2 text-sm text-rose-400">{errors.source_city_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Destination City ID</label>
              <input {...register('destination_city_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Example: 2" />
              {errors.destination_city_id ? <p className="mt-2 text-sm text-rose-400">{errors.destination_city_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Delivery Zone ID</label>
              <input {...register('delivery_zone_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Optional" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Service Type</label>
              <input {...register('service_type')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Standard" />
              {errors.service_type ? <p className="mt-2 text-sm text-rose-400">{errors.service_type.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Min Weight (kg)</label>
              <input {...register('min_weight')} type="number" step="0.1" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="0" />
              {errors.min_weight ? <p className="mt-2 text-sm text-rose-400">{errors.min_weight.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Max Weight (kg)</label>
              <input {...register('max_weight')} type="number" step="0.1" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="5" />
              {errors.max_weight ? <p className="mt-2 text-sm text-rose-400">{errors.max_weight.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Base Price</label>
              <input {...register('base_price')} type="number" step="0.01" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="50" />
              {errors.base_price ? <p className="mt-2 text-sm text-rose-400">{errors.base_price.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Extra Cost</label>
              <input {...register('extra_cost')} type="number" step="0.01" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="0" />
              {errors.extra_cost ? <p className="mt-2 text-sm text-rose-400">{errors.extra_cost.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Estimated Delivery Days</label>
              <input {...register('estimated_delivery_days')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="2" />
              {errors.estimated_delivery_days ? <p className="mt-2 text-sm text-rose-400">{errors.estimated_delivery_days.message}</p> : null}
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
            <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving…' : editingRule ? 'Save changes' : 'Create rule'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
