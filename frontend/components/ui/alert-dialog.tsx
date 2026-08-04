import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card } from './card'
import { Button } from './button'

export interface AlertDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  isSubmitting?: boolean
  confirmVariant?: 'danger' | 'primary'
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isSubmitting,
  confirmVariant = 'danger',
}: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <Card className="relative z-10 w-full max-w-md border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/70" role="dialog" aria-modal="true">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Confirm</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          </div>
        </div>

        <div className="rounded-[20px] border border-rose-500/20 bg-rose-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-300" />
            <p className="text-sm leading-7 text-slate-300">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={confirmVariant === 'danger' ? 'danger' : 'primary'} type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Processing…' : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}
