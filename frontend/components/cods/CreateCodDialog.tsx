"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Cod, CodCreatePayload } from '@/types/cod'

type Form = CodCreatePayload

const schema = z.object({
  shipment_id: z.preprocess((value) => Number(value), z.number().min(1, 'Shipment is required')),
  amount: z.preprocess((value) => Number(value), z.number().min(0, 'Amount must be 0 or greater')),
  currency: z.string().trim().min(1, 'Currency is required').optional(),
  collected: z.boolean().optional(),
  collected_at: z.string().optional().or(z.literal('')).transform((value) => (value === '' ? null : value)),
  collected_by_driver_id: z.preprocess((value) => (value === '' || value === undefined || value === null ? null : Number(value)), z.number().nullable().optional()),
  transferred_to_customer: z.boolean().optional(),
  transferred_at: z.string().optional().or(z.literal('')).transform((value) => (value === '' ? null : value)),
  notes: z.string().optional().or(z.literal('')).transform((value) => (value === '' ? null : value)),
})

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editing?: Partial<Cod> | null
}

export default function CreateCodDialog({ open, onClose, onSubmit, isSubmitting, submitError, editing }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const defaultValues = useMemo<Form>(() => ({
    shipment_id: 0,
    amount: 0,
    currency: 'EGP',
    collected: false,
    collected_at: null,
    collected_by_driver_id: null,
    transferred_to_customer: false,
    transferred_at: null,
    notes: null,
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
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Create COD</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">New COD record</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Shipment ID</label>
                <input {...register('shipment_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="1" />
                {errors.shipment_id ? <p className="mt-2 text-sm text-rose-400">{errors.shipment_id.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Amount</label>
                <input {...register('amount')} type="number" step="0.01" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="100.00" />
                {errors.amount ? <p className="mt-2 text-sm text-rose-400">{errors.amount.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Currency</label>
                <input {...register('currency')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="EGP" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Collected by Driver ID</label>
                <input {...register('collected_by_driver_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Optional" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" {...register('collected')} className="h-4 w-4 rounded border-white/10 bg-slate-950" />
                Collected
              </label>
              <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" {...register('transferred_to_customer')} className="h-4 w-4 rounded border-white/10 bg-slate-950" />
                Transferred to customer
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Collected at</label>
                <input {...register('collected_at')} type="datetime-local" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Transferred at</label>
                <input {...register('transferred_at')} type="datetime-local" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
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
                  {isSubmitting ? 'Saving…' : 'Save COD'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
