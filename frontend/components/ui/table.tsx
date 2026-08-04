import * as React from 'react'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export function Table({ className = '', ...props }: TableProps) {
  return <table className={`min-w-full text-left text-sm text-slate-300 ${className}`.trim()} {...props} />
}

export function TableHead({ className = '', ...props }: React.ThHTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-white/10 bg-slate-900/60 text-slate-500 ${className}`.trim()} {...props} />
}

export function TableRow({ className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`transition hover:bg-white/5 ${className}`.trim()} {...props} />
}

export function TableCell({ className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-6 py-6 ${className}`.trim()} {...props} />
}

export function TableHeaderCell({ className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.25em] ${className}`.trim()} {...props} />
}
