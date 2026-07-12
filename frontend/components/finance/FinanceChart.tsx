type FinanceChartProps = {
  title: string
  data: Array<{ label: string; value: number }>
}

export default function FinanceChart({ title, data }: FinanceChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Updated</span>
      </div>
      <div className="mt-4 flex h-52 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end rounded-xl bg-slate-800/70 p-1">
              <div
                className="w-full rounded-lg bg-gradient-to-t from-cyan-500 via-sky-400 to-emerald-400"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-medium text-white">{item.label}</p>
              <p className="text-[10px] text-slate-500">EGP {item.value.toLocaleString('en-US')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
