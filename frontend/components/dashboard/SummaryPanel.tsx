type SummaryItem = {
  title: string
  value: string
  detail: string
}

type RecentActivityItem = {
  label: string
  value: string
}

type SummaryPanelProps = {
  topCustomer: SummaryItem
  topBranch: SummaryItem
  topDriver: SummaryItem
  recentActivity: RecentActivityItem[]
}

function SummaryCard({ title, value, detail }: SummaryItem) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-3 text-[1.25rem] font-semibold text-white">{value}</p>
      <p className="mt-2 text-[0.95rem] text-slate-500">{detail}</p>
    </div>
  )
}

export default function SummaryPanel({ topCustomer, topBranch, topDriver, recentActivity }: SummaryPanelProps) {
  return (
    <section className="space-y-4">
      <SummaryCard {...topCustomer} />
      <SummaryCard {...topBranch} />
      <SummaryCard {...topDriver} />
      <div className="glass-card rounded-[24px] border-white/10 p-5">
        <p className="text-sm text-slate-400">Recent activity</p>
        <div className="mt-4 space-y-3">
          {recentActivity.map((item) => (
            <div key={item.label} className="rounded-[18px] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-[0.95rem] text-slate-400">{item.label}</p>
              <p className="mt-2 text-[1.25rem] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
