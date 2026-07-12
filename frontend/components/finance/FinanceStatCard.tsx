type FinanceStatCardProps = {
  title: string
  value: string
  subtitle: string
  accent: string
}

export default function FinanceStatCard({ title, value, subtitle, accent }: FinanceStatCardProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}
