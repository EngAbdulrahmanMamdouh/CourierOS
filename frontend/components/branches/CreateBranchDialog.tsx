"use client"

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  name: z.string().trim().min(2, 'Branch name is required'),
  code: z.string().trim().min(2, 'Branch code is required'),
  city: z.string().trim().min(2, 'City is required'),
  address: z.string().trim().min(3, 'Address is required'),
  phone: z.string().trim().min(5, 'Phone is required'),
  manager_name: z.string().trim().min(2, 'Manager name is required'),
  is_active: z.preprocess(
    (value) => (typeof value === 'string' ? value === 'true' : value),
    z.boolean(),
  ),
})

type Form = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: Form) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
}

export default function CreateBranchDialog({ open, onClose, onSubmit, isSubmitting, submitError }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur' })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div ref={dialogRef} className={`w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Create branch</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">New branch</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Branch Name</label>
            <input {...register('name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Branch name" />
            {errors.name ? <p className="mt-2 text-sm text-rose-400">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Branch Code</label>
            <input {...register('code')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Branch code" />
            {errors.code ? <p className="mt-2 text-sm text-rose-400">{errors.code.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">City</label>
            <input {...register('city')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="City" />
            {errors.city ? <p className="mt-2 text-sm text-rose-400">{errors.city.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Address</label>
            <input {...register('address')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Address" />
            {errors.address ? <p className="mt-2 text-sm text-rose-400">{errors.address.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Phone</label>
            <input {...register('phone')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Phone" />
            {errors.phone ? <p className="mt-2 text-sm text-rose-400">{errors.phone.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Manager Name</label>
            <input {...register('manager_name')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400" placeholder="Manager name" />
            {errors.manager_name ? <p className="mt-2 text-sm text-rose-400">{errors.manager_name.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Status</label>
            <select {...register('is_active')} className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {submitError && <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving…' : 'Save branch'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
