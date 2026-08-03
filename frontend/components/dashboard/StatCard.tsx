import { Package } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string
  trend: string
  subtitle: string
}

export default function StatCard({ title, value, trend, subtitle }: StatCardProps) {
  const normalizedTrend = trend.toLowerCase()
  const badgeClassName =
    normalizedTrend.includes('risk') || normalizedTrend.includes('cancel')
      ? 'bg-red-500/10 text-red-300'
      : normalizedTrend.includes('warning') || normalizedTrend.includes('pending') || normalizedTrend.includes('tracking')
        ? 'bg-amber-500/10 text-amber-300'
        : 'bg-emerald-500/10 text-emerald-300'

  return (
    <article className="group h-full min-h-[160px] rounded-[24px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-200 hover:-translate-y-[2px] hover:border-white/[0.16] hover:shadow-lg">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{title}</p>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-400/10 text-sky-400">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold tracking-tight text-white">{value}</h2>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-400">{subtitle}</p>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClassName}`}>
            {trend}
          </span>
        </div>
      </div>
    </article>
  )
}
