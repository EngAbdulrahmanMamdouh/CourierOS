"use client"

import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getAuthenticatedCompanyId } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { User } from '@/services/user'

export type UserFormValues = {
  username: string
  full_name: string
  email: string
  phone: string
  password?: string
  role: string
  company_id?: number | null
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormValues) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  editing?: User | null
}

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

const emptyStringToOptionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return value
}, z.coerce.number().optional())

const schema = z.object({
  username: z.string().trim().min(2, 'Username is required'),
  full_name: optionalStringField(),
  email: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return ''
    }

    return value
  }, z.union([z.literal(''), z.string().trim().email('Email must be valid')])),
  phone: optionalStringField(),
  password: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }

    if (typeof value === 'string') {
      return value.trim()
    }

    return value
  }, z.string().trim().min(6, 'Password must be at least 6 characters').optional()),
  role: z.string().trim().min(1, 'Role is required'),
  company_id: emptyStringToOptionalNumber,
})

export default function UserDialog({ open, onClose, onSubmit, isSubmitting, submitError, editing }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  const defaultValues = useMemo<UserFormValues>(() => ({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    company_id: getAuthenticatedCompanyId(),
  }), [])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  useEffect(() => {
    if (!editing) {
      reset(defaultValues)
      return
    }

    reset({
      username: editing.username,
      full_name: editing.full_name ?? '',
      email: editing.email,
      phone: editing.phone ?? '',
      password: '',
      role: editing.role,
      company_id: editing.company_id,
    })
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
    <Dialog open={open} onClose={onClose} className="max-w-[600px] rounded-xl p-6 shadow-xl">
      <div ref={dialogRef} className="max-h-[80vh] overflow-y-auto pr-1">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{editing ? 'Edit user' : 'Create user'}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{editing ? 'Update user' : 'New user'}</h2>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-username">Username</Label>
              <Input id="user-username" {...register('username')} placeholder="jdoe" />
              {errors.username ? <p className="text-sm text-rose-400">{errors.username.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-full-name">Full name</Label>
              <Input id="user-full-name" {...register('full_name')} placeholder="Jane Doe" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" {...register('email')} placeholder="name@example.com" />
              {errors.email ? <p className="text-sm text-rose-400">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone</Label>
              <Input id="user-phone" {...register('phone')} placeholder="01000000000" />
            </div>
          </div>

          {!editing ? (
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input id="user-password" type="password" {...register('password')} placeholder="At least 6 characters" />
              {errors.password ? <p className="text-sm text-rose-400">{errors.password.message}</p> : null}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select id="user-role" {...register('role')}>
                <option value="super_admin">Super admin</option>
                <option value="company_admin">Company admin</option>
                <option value="branch_manager">Branch manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="driver">Driver</option>
                <option value="employee">Employee</option>
              </Select>
              {errors.role ? <p className="text-sm text-rose-400">{errors.role.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-company">Company</Label>
              <Select id="user-company" {...register('company_id')}>
                <option value="">Select company</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </Select>
            </div>
          </div>

          {submitError ? <p className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{submitError}</p> : null}

          <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
