import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400 ${className}`.trim()}
    {...props}
  />
))

Input.displayName = 'Input'
