"use client"

import { X } from 'lucide-react'

type DeleteConfirmationDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete shipment',
  description = 'This action cannot be undone.',
}: DeleteConfirmationDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/70">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Confirm action</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200 transition hover:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm leading-7 text-slate-400">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-[16px] bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
