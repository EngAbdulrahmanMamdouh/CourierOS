"use client"

import { useEffect, useState } from 'react'
import { CheckCircle2, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import type { User } from '@/services/user'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (active: boolean) => Promise<void> | void
  isSubmitting?: boolean
  user: User | null
  currentStatus?: boolean
}

export default function StatusToggle({ open, onClose, onConfirm, isSubmitting, user, currentStatus }: Props) {
  const [active, setActive] = useState(currentStatus ?? true)

  useEffect(() => setActive(currentStatus ?? true), [currentStatus, open])

  if (!open || !user) return null

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <div className="mb-6 flex items-start justify-between gap-4 pt-10">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Account status</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{active ? 'Disable' : 'Enable'} {user.username}</h2>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Active account</p>
            <p className="mt-1 text-sm text-slate-400">Allow this user to sign in and access the workspace.</p>
          </div>
          <div className="flex items-center gap-3">
            {active ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Ban className="h-5 w-5 text-slate-400" />}
            <Button type="button" variant={active ? 'secondary' : 'outline'} onClick={() => setActive((current) => !current)} className="h-7 w-12 rounded-full p-0">
              <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="button" variant={active ? 'secondary' : 'primary'} onClick={() => onConfirm(active)} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : active ? 'Disable account' : 'Enable account'}
        </Button>
      </div>
    </Dialog>
  )
}
