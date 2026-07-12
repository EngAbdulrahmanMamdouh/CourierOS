type FinanceFilterBarProps = {
  dateFrom: string
  dateTo: string
  customer: string
  courier: string
  customerOptions: string[]
  courierOptions: string[]
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onCustomerChange: (value: string) => void
  onCourierChange: (value: string) => void
}

export default function FinanceFilterBar({
  dateFrom,
  dateTo,
  customer,
  courier,
  customerOptions,
  courierOptions,
  onDateFromChange,
  onDateToChange,
  onCustomerChange,
  onCourierChange,
}: FinanceFilterBarProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm text-slate-400">
          <span className="mb-2 block">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-sm text-slate-400">
          <span className="mb-2 block">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-sm text-slate-400">
          <span className="mb-2 block">Customer</span>
          <select
            value={customer}
            onChange={(event) => onCustomerChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
          >
            {customerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400">
          <span className="mb-2 block">Courier</span>
          <select
            value={courier}
            onChange={(event) => onCourierChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
          >
            {courierOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
