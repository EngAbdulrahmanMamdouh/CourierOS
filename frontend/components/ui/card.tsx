import * as React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`rounded-[28px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/40 ${className}`.trim()} {...props} />
}
