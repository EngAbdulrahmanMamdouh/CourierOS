"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

type Form = {
  full_name: string
  employee_code?: string
  national_id: string
  phone: string
  email?: string
  vehicle_type: string
  vehicle_plate: string
  license_number: string
  license_expiry?: string
  status: string
  availability: string
  branch_id?: number | null
  is_active: boolean
}

const schema = (t: (key: string) => string) => z.object({
  full_name: z.string().trim().min(2, t('drivers.errors.full_name_required')),
  employee_code: z.string().trim().optional(),
  national_id: z.string().trim().min(5, t('drivers.errors.national_id_required')),
  phone: z.string().trim().min(5, t('drivers.errors.phone_required')),
  email: z.string().trim().email(t('drivers.errors.email_invalid')).optional().or(z.literal('')).transform((value) => (value === '' ? undefined : value)),
  vehicle_type: z.string().trim().min(2, t('drivers.errors.vehicle_type_required')),
  vehicle_plate: z.string().trim().min(2, t('drivers.errors.vehicle_plate_required')),
  license_number: z.string().trim().min(2, t('drivers.errors.license_number_required')),
  license_expiry: z.string().optional(),
  status: z.string().trim().min(1, t('drivers.errors.status_required')),
  availability: z.string().trim().min(1, t('drivers.errors.availability_required')),
  branch_id: z.preprocess(
    (value) => {
      if (value === '' || value === undefined || value === null) {
        return undefined
      }
      return Number(value)
    },
    z.number().optional().nullable(),
  ),
  is_active: z.preprocess((value) => (typeof value === 'string' ? value === 'true' : value), z.boolean()),
})

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editing?: Partial<Form> | null
}

export default function CreateDriverDialog({ open, onClose, onSubmit, isSubmitting, submitError, editing }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    full_name: '',
    employee_code: undefined,
    national_id: '',
    phone: '',
    email: undefined,
    vehicle_type: '',
    vehicle_plate: '',
    license_number: '',
    license_expiry: undefined,
    status: 'Active',
    availability: 'Available',
    branch_id: undefined,
    is_active: true,
  }), [])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema(t)),
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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('drivers.create_title')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t('drivers.create_subtitle')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.full_name')}</label>
              <input {...register('full_name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.full_name')} />
              {errors.full_name ? <p className="mt-2 text-sm text-rose-400">{errors.full_name.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.phone')}</label>
              <input {...register('phone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.phone')} />
              {errors.phone ? <p className="mt-2 text-sm text-rose-400">{errors.phone.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.national_id')}</label>
              <input {...register('national_id')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.national_id')} />
              {errors.national_id ? <p className="mt-2 text-sm text-rose-400">{errors.national_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.email')}</label>
              <input {...register('email')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.email')} />
              {errors.email ? <p className="mt-2 text-sm text-rose-400">{errors.email.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.vehicle_type')}</label>
              <input {...register('vehicle_type')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.vehicle_type')} />
              {errors.vehicle_type ? <p className="mt-2 text-sm text-rose-400">{errors.vehicle_type.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.vehicle_plate')}</label>
              <input {...register('vehicle_plate')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.vehicle_plate')} />
              {errors.vehicle_plate ? <p className="mt-2 text-sm text-rose-400">{errors.vehicle_plate.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.license_number')}</label>
              <input {...register('license_number')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.license_number')} />
              {errors.license_number ? <p className="mt-2 text-sm text-rose-400">{errors.license_number.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.license_expiry')}</label>
              <input {...register('license_expiry')} type="date" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.branch_id')}</label>
              <input {...register('branch_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('drivers.placeholder.branch_id')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.availability')}</label>
              <select {...register('availability')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="Available">{t('drivers.option.availability.available')}</option>
                <option value="Unavailable">{t('drivers.option.availability.unavailable')}</option>
                <option value="On Duty">{t('drivers.option.availability.on_duty')}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.status')}</label>
              <select {...register('status')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="Active">{t('drivers.option.status.active')}</option>
                <option value="Inactive">{t('drivers.option.status.inactive')}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t('drivers.label.is_active')}</label>
              <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="true">{t('drivers.option.is_active.active')}</option>
                <option value="false">{t('drivers.option.is_active.inactive')}</option>
              </select>
            </div>
          </div>

          {submitError && <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p>}

          <div ref={footerRef} className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-white/10 bg-slate-900/95 px-6 pb-2 pt-5 sm:flex sm:justify-end">
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">{t('common.button.cancel')}</button>
              <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? t('common.button.processing') : t('drivers.button.save')}</button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
