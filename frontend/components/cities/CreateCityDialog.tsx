"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import type { City } from '@/types/city'

const schema = z.object({
  name: z.string().trim().min(2, 'City name is required'),
  code: z.string().trim().min(2, 'City code is required'),
  governorate: z.string().trim().min(2, 'Governorate is required'),
  is_active: z.string().trim().min(1, 'Status is required'),
})

type Form = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editingCity?: City | null
}

export default function CreateCityDialog({ open, onClose, onSubmit, isSubmitting, submitError, editingCity }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    name: editingCity?.name ?? '',
    code: editingCity?.code ?? '',
    governorate: editingCity?.governorate ?? '',
    is_active: editingCity?.is_active ? 'true' : 'false',
  }), [editingCity])

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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{editingCity ? t('cities.update_title') : t('cities.create_title')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{editingCity ? t('cities.update_title') : t('cities.create_subtitle')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('cities.label.name')}</label>
              <input {...register('name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('cities.placeholder.name')} />
              {errors.name ? <p className="mt-2 text-sm text-rose-400">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('cities.label.code')}</label>
              <input {...register('code')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('cities.placeholder.code')} />
              {errors.code ? <p className="mt-2 text-sm text-rose-400">{errors.code.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('cities.label.governorate')}</label>
              <input {...register('governorate')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('cities.placeholder.governorate')} />
              {errors.governorate ? <p className="mt-2 text-sm text-rose-400">{errors.governorate.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('cities.label.status')}</label>
              <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="true">{t('cities.option.status.active')}</option>
                <option value="false">{t('cities.option.status.inactive')}</option>
              </select>
            </div>
          </div>

          {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">{t('common.button.cancel')}</button>
            <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? t('common.button.processing') : editingCity ? t('cities.button.save_changes') : t('cities.button.create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
