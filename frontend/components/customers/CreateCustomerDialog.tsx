"use client"

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().min(5, 'Phone is required'),
  email: z.string().trim().email('Email must be a valid address').optional().or(z.literal('')).transform((value) => (value === '' ? undefined : value)),
  address: z.string().trim().min(3, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
})

type Form = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
}

export default function CreateCustomerDialog({ open, onClose, onSubmit, isSubmitting, submitError }: Props) {
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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Create customer</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">New customer</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(async (data) => {
            console.log('CreateCustomerDialog handleSubmit called', data)
            await onSubmit(data)
            console.log('CreateCustomerDialog onSubmit finished')
          })}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Full name</label>
            <input
              {...register('full_name')}
              className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
              placeholder="Full name"
            />
            {errors.full_name ? <p className="mt-2 text-sm text-rose-400">{errors.full_name.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Phone</label>
            <input
              {...register('phone')}
              className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
              placeholder="01000000000"
            />
            {errors.phone ? <p className="mt-2 text-sm text-rose-400">{errors.phone.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
            <input
              {...register('email')}
              className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
              placeholder="name@example.com"
            />
            {errors.email ? <p className="mt-2 text-sm text-rose-400">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Address</label>
            <input
              {...register('address')}
              className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
            />
            {errors.address ? <p className="mt-2 text-sm text-rose-400">{errors.address.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">City</label>
            <input
              {...register('city')}
              className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
            />
            {errors.city ? <p className="mt-2 text-sm text-rose-400">{errors.city.message}</p> : null}
          </div>

          {submitError && <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Cancel</button>
            <button type="submit" onClick={() => console.log('CreateCustomerDialog Save button clicked')} disabled={isSubmitting} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving…' : 'Save customer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
