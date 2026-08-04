import * as React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', children, ...props }, ref) => (
  <select
    ref={ref}
    className={`h-12 w-full rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400 ${className}`.trim()}
    {...props}
  >
    {children}
  </select>
))

Select.displayName = 'Select'
