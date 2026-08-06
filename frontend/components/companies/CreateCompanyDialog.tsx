"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import type { Company, CompanyCreatePayload } from '@/types/company'

type Form = CompanyCreatePayload

const optionalStringField = () =>
  z.preprocess((value) => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }

    if (typeof value === 'string') {
      return value.trim()
    }

    return value
  }, z.string().trim().optional())

const schema = (t: (key: string) => string) => z.object({
  name: z.string().trim().min(2, t('companies.errors.name_required')),
  code: z.string().trim().min(2, t('companies.errors.code_required')),
  email: optionalStringField().pipe(z.string().trim().email(t('companies.errors.email_invalid')).optional()),
  phone: optionalStringField(),
  address: optionalStringField(),
  city: optionalStringField(),
  country: optionalStringField(),
  tax_number: optionalStringField(),
  commercial_register: optionalStringField(),
  logo_url: optionalStringField(),
  subscription_plan: optionalStringField(),
  subscription_status: optionalStringField(),
  is_active: z.boolean().optional(),
})

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editing?: Partial<Company> | null
}

export default function CreateCompanyDialog({ open, onClose, onSubmit, isSubmitting, submitError, editing }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    name: '',
    code: '',
    email: undefined,
    phone: undefined,
    address: undefined,
    city: undefined,
    country: undefined,
    tax_number: undefined,
    commercial_register: undefined,
    logo_url: undefined,
    subscription_plan: undefined,
    subscription_status: undefined,
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
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('companies.create_title')}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{t('companies.create_subtitle')}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.name')}</label>
                <input {...register('name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.name')} />
                {errors.name ? <p className="mt-2 text-sm text-rose-400">{errors.name.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.code')}</label>
                <input {...register('code')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.code')} />
                {errors.code ? <p className="mt-2 text-sm text-rose-400">{errors.code.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.email')}</label>
                <input {...register('email')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.email')} />
                {errors.email ? <p className="mt-2 text-sm text-rose-400">{errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.phone')}</label>
                <input {...register('phone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.phone')} />
                {errors.phone ? <p className="mt-2 text-sm text-rose-400">{errors.phone.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.address')}</label>
                <input {...register('address')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.address')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.city')}</label>
                <input {...register('city')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.city')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.country')}</label>
                <input {...register('country')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.country')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.tax_number')}</label>
                <input {...register('tax_number')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.tax_number')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.commercial_register')}</label>
                <input {...register('commercial_register')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.commercial_register')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.subscription_plan')}</label>
                <input {...register('subscription_plan')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.subscription_plan')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.subscription_status')}</label>
                <input {...register('subscription_status')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder={t('companies.placeholder.subscription_status')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">{t('companies.label.is_active')}</label>
                <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                  <option value="true">{t('companies.option.status.active')}</option>
                  <option value="false">{t('companies.option.status.inactive')}</option>
                </select>
              </div>
            </div>

            {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

            <div ref={footerRef} className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-white/10 bg-slate-900/95 px-6 pb-2 pt-5 sm:flex sm:justify-end">
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">{t('common.button.cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? t('common.button.processing') : t('companies.button.save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
