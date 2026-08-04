import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-500/15 text-slate-200',
  primary: 'bg-sky-500/15 text-sky-300',
  success: 'bg-emerald-500/15 text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-300',
  danger: 'bg-rose-500/15 text-rose-300',
  muted: 'bg-slate-700/50 text-slate-300',
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${variants[variant]} ${className}`.trim()} {...props} />
}
