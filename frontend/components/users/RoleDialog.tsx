"use client"

import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { User } from '@/services/user'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (role: string) => Promise<void> | void
  isSubmitting?: boolean
  user: User | null
  currentRole?: string
}

const roles = ['super_admin', 'company_admin', 'branch_manager', 'dispatcher', 'driver', 'employee']

export default function RoleDialog({ open, onClose, onConfirm, isSubmitting, user, currentRole }: Props) {
  const [role, setRole] = useState(currentRole ?? 'employee')

  useEffect(() => setRole(currentRole ?? 'employee'), [currentRole, open])

  if (!open || !user) return null

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <div className="mb-6 flex items-start justify-between gap-4 pt-10">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Change role</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Set role for {user.username}</h2>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center gap-3 text-slate-200">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          <p className="text-sm font-semibold">Select the access level for this account.</p>
        </div>

        <Label htmlFor="role-select">Role</Label>
        <Select id="role-select" value={role} onChange={(event) => setRole(event.target.value)}>
          {roles.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="primary" onClick={() => onConfirm(role)} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save role'}
        </Button>
      </div>
    </Dialog>
  )
}
