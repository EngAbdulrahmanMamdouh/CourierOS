import * as React from 'react'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className = '', ...props }, ref) => (
  <label ref={ref} className={`mb-2 block text-sm font-semibold text-slate-200 ${className}`.trim()} {...props} />
))

Label.displayName = 'Label'
