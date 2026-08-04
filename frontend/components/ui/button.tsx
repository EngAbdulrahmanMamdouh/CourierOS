import * as React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-900/20',
  secondary: 'bg-slate-800/80 text-slate-100 hover:bg-slate-700 border border-white/10',
  outline: 'border border-white/10 bg-transparent text-slate-100 hover:bg-slate-800/60',
  danger: 'bg-rose-500 text-slate-950 hover:bg-rose-400 shadow-lg shadow-rose-900/20',
  ghost: 'bg-transparent text-slate-100 hover:bg-slate-800/70 border border-white/10',
}

export function Button({ className = '', variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-[16px] px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  )
}
