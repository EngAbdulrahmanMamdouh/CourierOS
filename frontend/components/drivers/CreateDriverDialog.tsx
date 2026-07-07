"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

const schema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  employee_code: z.string().trim().optional(),
  national_id: z.string().trim().min(5, 'National ID is required'),
  phone: z.string().trim().min(5, 'Phone is required'),
  email: z.string().trim().email('Email must be valid').optional().or(z.literal('')).transform((value) => (value === '' ? undefined : value)),
  vehicle_type: z.string().trim().min(2, 'Vehicle type is required'),
  vehicle_plate: z.string().trim().min(2, 'Vehicle plate is required'),
  license_number: z.string().trim().min(2, 'License number is required'),
  license_expiry: z.string().optional(),
  status: z.string().trim().min(1, 'Status is required'),
  availability: z.string().trim().min(1, 'Availability is required'),
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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Create driver</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">New driver</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Full name</label>
              <input {...register('full_name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Driver full name" />
              {errors.full_name ? <p className="mt-2 text-sm text-rose-400">{errors.full_name.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Phone</label>
              <input {...register('phone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="01000000000" />
              {errors.phone ? <p className="mt-2 text-sm text-rose-400">{errors.phone.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">National ID</label>
              <input {...register('national_id')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="12345678901234" />
              {errors.national_id ? <p className="mt-2 text-sm text-rose-400">{errors.national_id.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
              <input {...register('email')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="name@example.com" />
              {errors.email ? <p className="mt-2 text-sm text-rose-400">{errors.email.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Vehicle type</label>
              <input {...register('vehicle_type')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Motorbike" />
              {errors.vehicle_type ? <p className="mt-2 text-sm text-rose-400">{errors.vehicle_type.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Vehicle plate</label>
              <input {...register('vehicle_plate')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="ABC-1234" />
              {errors.vehicle_plate ? <p className="mt-2 text-sm text-rose-400">{errors.vehicle_plate.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">License number</label>
              <input {...register('license_number')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="LIC-001" />
              {errors.license_number ? <p className="mt-2 text-sm text-rose-400">{errors.license_number.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">License expiry</label>
              <input {...register('license_expiry')} type="date" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Branch ID</label>
              <input {...register('branch_id')} type="number" className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Branch ID" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Availability</label>
              <select {...register('availability')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="On Duty">On Duty</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Status</label>
              <select {...register('status')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Driver active</label>
              <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {submitError && <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p>}

          <div ref={footerRef} className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-white/10 bg-slate-900/95 px-6 pb-2 pt-5 sm:flex sm:justify-end">
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving…' : 'Save driver'}</button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
