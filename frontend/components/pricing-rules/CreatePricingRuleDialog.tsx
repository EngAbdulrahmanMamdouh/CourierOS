"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { PricingRule } from '@/types/pricingRule'

const schema = (t: (key: string) => string) => z.object({
  source_city_id: z.string().trim().min(1, t('pricingRules.errors.source_city_required')),
  destination_city_id: z.string().trim().min(1, t('pricingRules.errors.destination_city_required')),
  delivery_zone_id: z.string().trim().optional(),
  service_type: z.string().trim().min(2, t('pricingRules.errors.service_type_required')),
  min_weight: z.string().trim().min(1, t('pricingRules.errors.min_weight_required')),
  max_weight: z.string().trim().min(1, t('pricingRules.errors.max_weight_required')),
  base_price: z.string().trim().min(1, t('pricingRules.errors.base_price_required')),
  extra_cost: z.string().trim().min(1, t('pricingRules.errors.extra_cost_required')),
  estimated_delivery_days: z.string().trim().min(1, t('pricingRules.errors.estimated_delivery_days_required')),
  is_active: z.string().trim().min(1, t('pricingRules.errors.status_required')),
})

type Form = z.infer<ReturnType<typeof schema>>

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
  const { t } = useTranslation()

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

  const formSchema = useMemo(() => schema(t), [t])
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(formSchema), mode: 'onBlur', defaultValues })

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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{editingRule ? t('pricingRules.update_title') : t('pricingRules.create_title')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{editingRule ? t('pricingRules.update_subtitle') : t('pricingRules.create_subtitle')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.source_city_id')}</label>
              <input {...register('source_city_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.source_city_id')} />
              {errors.source_city_id ? <p className="mt-2 text-sm text-rose-400">{errors.source_city_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.destination_city_id')}</label>
              <input {...register('destination_city_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.destination_city_id')} />
              {errors.destination_city_id ? <p className="mt-2 text-sm text-rose-400">{errors.destination_city_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.delivery_zone_id')}</label>
              <input {...register('delivery_zone_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.delivery_zone_id')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.service_type')}</label>
              <input {...register('service_type')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.service_type')} />
              {errors.service_type ? <p className="mt-2 text-sm text-rose-400">{errors.service_type.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.min_weight')}</label>
              <input {...register('min_weight')} type="number" step="0.1" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.min_weight')} />
              {errors.min_weight ? <p className="mt-2 text-sm text-rose-400">{errors.min_weight.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.max_weight')}</label>
              <input {...register('max_weight')} type="number" step="0.1" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.max_weight')} />
              {errors.max_weight ? <p className="mt-2 text-sm text-rose-400">{errors.max_weight.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.base_price')}</label>
              <input {...register('base_price')} type="number" step="0.01" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.base_price')} />
              {errors.base_price ? <p className="mt-2 text-sm text-rose-400">{errors.base_price.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.extra_cost')}</label>
              <input {...register('extra_cost')} type="number" step="0.01" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.extra_cost')} />
              {errors.extra_cost ? <p className="mt-2 text-sm text-rose-400">{errors.extra_cost.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.estimated_delivery_days')}</label>
              <input {...register('estimated_delivery_days')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('pricingRules.placeholder.estimated_delivery_days')} />
              {errors.estimated_delivery_days ? <p className="mt-2 text-sm text-rose-400">{errors.estimated_delivery_days.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('pricingRules.label.status')}</label>
              <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="true">{t('pricingRules.option.status.active')}</option>
                <option value="false">{t('pricingRules.option.status.inactive')}</option>
              </select>
            </div>
          </div>

          {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">{t('pricingRules.button.cancel')}</button>
            <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? t('pricingRules.button.saving') : editingRule ? t('pricingRules.button.save_changes') : t('pricingRules.button.create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
