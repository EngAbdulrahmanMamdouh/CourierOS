"use client"

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getAuthenticatedCompanyId } from '@/services/auth'
import { createCompanySettings, fetchCompanySettings, updateCompanySettings } from '@/services/companySettings'
import type { CompanySettings, CompanySettingsPayload } from '@/types/companySettings'

const schema = z.object({
  company_name: z.string().trim().min(2, 'Company name is required'),
  support_phone: z.string().trim().optional().or(z.literal('')),
  support_email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  currency: z.string().trim().min(1, 'Currency is required'),
  timezone: z.string().trim().min(1, 'Timezone is required'),
  language: z.string().trim().min(1, 'Language is required'),
  shipment_prefix: z.string().trim().min(1, 'Shipment prefix is required'),
  tracking_prefix: z.string().trim().min(1, 'Tracking prefix is required'),
  cod_percentage: z.coerce.number().min(0).max(100),
  tax_percentage: z.coerce.number().min(0).max(100),
  shipping_providers: z.string().trim().min(1, 'Shipping providers are required'),
  is_active: z.preprocess(
    (value) => (typeof value === 'string' ? value === 'true' : value),
    z.boolean(),
  ),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  company_name: '',
  support_phone: '',
  support_email: '',
  currency: 'USD',
  timezone: 'UTC',
  language: 'en',
  shipment_prefix: 'SHIP',
  tracking_prefix: 'TRK',
  cod_percentage: 0,
  tax_percentage: 0,
  shipping_providers: 'FedEx, UPS',
  is_active: true,
}

export default function CompanySettingsPageClient() {
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    let active = true

    async function loadSettings() {
      try {
        const companyId = getAuthenticatedCompanyId()

        if (companyId === null) {
          throw new Error('Authentication context is unavailable.')
        }

        setCurrentCompanyId(companyId)

        const data = await fetchCompanySettings(companyId)
        if (!active) return

        const normalizedSettings = {
          ...data,
          tracking_prefix: data.tracking_prefix || data.shipment_prefix || 'TRK',
          cod_percentage: data.cod_percentage ?? 0,
          tax_percentage: data.tax_percentage ?? 0,
          shipping_providers: data.shipping_providers || 'FedEx, UPS',
        } as CompanySettings

        setSettings(normalizedSettings)
        reset({
          company_name: normalizedSettings.company_name,
          support_phone: normalizedSettings.support_phone ?? '',
          support_email: normalizedSettings.support_email ?? '',
          currency: normalizedSettings.currency,
          timezone: normalizedSettings.timezone,
          language: normalizedSettings.language,
          shipment_prefix: normalizedSettings.shipment_prefix,
          tracking_prefix: normalizedSettings.tracking_prefix,
          cod_percentage: normalizedSettings.cod_percentage,
          tax_percentage: normalizedSettings.tax_percentage,
          shipping_providers: normalizedSettings.shipping_providers,
          is_active: normalizedSettings.is_active,
        })
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load company settings.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      active = false
    }
  }, [reset])

  const pageTitle = useMemo(() => settings?.company_name || 'Company settings', [settings])

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const resolvedCompanyId = currentCompanyId ?? getAuthenticatedCompanyId()

      if (resolvedCompanyId === null) {
        setError('Authentication context is unavailable.')
        setIsSaving(false)
        return
      }

      const payload: CompanySettingsPayload = {
        company_id: resolvedCompanyId,
        company_name: values.company_name,
        company_logo: null,
        currency: values.currency,
        timezone: values.timezone,
        language: values.language,
        shipment_prefix: values.shipment_prefix,
        invoice_prefix: values.shipment_prefix,
        barcode_prefix: values.tracking_prefix,
        default_cod_percentage: Number(values.cod_percentage),
        default_tax_percentage: Number(values.tax_percentage),
        sms_provider: null,
        email_provider: null,
        whatsapp_provider: null,
        default_shipment_status: 'pending',
        support_email: values.support_email || null,
        support_phone: values.support_phone || null,
        website: null,
        is_active: values.is_active,
      }

      if (settings) {
        const updatedSettings = await updateCompanySettings(resolvedCompanyId, payload)
        setSettings(updatedSettings)
        setCurrentCompanyId(updatedSettings.company_id)
        setSuccessMessage('Company settings updated successfully.')
      } else {
        const createdSettings = await createCompanySettings(payload)
        setSettings(createdSettings)
        setCurrentCompanyId(createdSettings.company_id)
        setSuccessMessage('Company settings created successfully.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save company settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[30px] border border-white/10 bg-slate-900/70 p-8 shadow-[0_32px_100px_rgba(2,6,23,0.45)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Company settings</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">{pageTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Manage the company profile, localization defaults, shipment behavior, and provider preferences.</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-300">
              {settings?.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading company settings…</div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-6 text-rose-300">{error}</div>
        ) : null}

        {!isLoading && successMessage ? (
          <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-300">{successMessage}</div>
        ) : null}

        {!isLoading ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Company Information</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Profile details</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Company Name</label>
                  <input {...register('company_name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.company_name ? <p className="mt-2 text-sm text-rose-400">{errors.company_name.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Support Phone</label>
                  <input {...register('support_phone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Support Email</label>
                  <input {...register('support_email')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.support_email ? <p className="mt-2 text-sm text-rose-400">{errors.support_email.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Status</label>
                  <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Localization</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Language and regional defaults</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Currency</label>
                  <input {...register('currency')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.currency ? <p className="mt-2 text-sm text-rose-400">{errors.currency.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Timezone</label>
                  <input {...register('timezone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.timezone ? <p className="mt-2 text-sm text-rose-400">{errors.timezone.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Language</label>
                  <input {...register('language')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.language ? <p className="mt-2 text-sm text-rose-400">{errors.language.message}</p> : null}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shipment</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Shipment identifiers</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Shipment Prefix</label>
                  <input {...register('shipment_prefix')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.shipment_prefix ? <p className="mt-2 text-sm text-rose-400">{errors.shipment_prefix.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Tracking Prefix</label>
                  <input {...register('tracking_prefix')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.tracking_prefix ? <p className="mt-2 text-sm text-rose-400">{errors.tracking_prefix.message}</p> : null}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Financial</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Default percentages</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">COD Percentage</label>
                  <input type="number" min="0" max="100" {...register('cod_percentage')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.cod_percentage ? <p className="mt-2 text-sm text-rose-400">{errors.cod_percentage.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Tax Percentage</label>
                  <input type="number" min="0" max="100" {...register('tax_percentage')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
                  {errors.tax_percentage ? <p className="mt-2 text-sm text-rose-400">{errors.tax_percentage.message}</p> : null}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Providers</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Shipping providers</h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Shipping Providers</label>
                <textarea {...register('shipping_providers')} rows={4} className="w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400" />
                {errors.shipping_providers ? <p className="mt-2 text-sm text-rose-400">{errors.shipping_providers.message}</p> : null}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-end gap-3 rounded-[24px] border border-white/10 bg-slate-900/70 p-4">
              <button type="submit" disabled={isSaving} className="rounded-[16px] bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  )
}
