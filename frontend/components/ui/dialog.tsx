import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { X } from 'lucide-react'
import { Card } from './card'
import { Button } from './button'

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className = '' }: DialogProps) {
  if (!open) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0 bg-slate-950/70" onClick={onClose} aria-hidden="true" />
      <Card
        className={`relative z-10 w-full max-w-[600px] scale-100 rounded-xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/80 transition-all duration-200 ease-out ${className}`.trim()}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute right-4 top-4">
          <Button variant="ghost" type="button" onClick={onClose} className="h-10 w-10 rounded-full border border-white/10 bg-slate-800/70 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </Card>
    </div>,
    document.body,
  )
}
