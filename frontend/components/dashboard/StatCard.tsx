type StatCardProps = {
  title: string
  value: string
  trend: string
  subtitle: string
}

export default function StatCard({ title, value, trend, subtitle }: StatCardProps) {
  return (
    <article className="glass-card h-full rounded-[24px] p-6 fade-in hover-elevate">
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{title}</p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight text-white">{value}</h2>
        </div>

        <div>
          <p className="mt-3 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-sky-200">{trend}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
