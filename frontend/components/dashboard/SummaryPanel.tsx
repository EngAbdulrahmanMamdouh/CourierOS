'use client'

import { useTranslation } from 'react-i18next'

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
    <div className="rounded-[14px] border border-white/[0.06] bg-slate-950/50 p-4 transition-all duration-150 hover:-translate-y-[1px] hover:border-sky-400/20 hover:bg-slate-900/70">
      <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-gray-400">{title}</p>
      <p className="mt-3 text-[24px] font-semibold leading-none text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{detail}</p>
    </div>
  )
}

export default function SummaryPanel({ topCustomer, topBranch, topDriver, recentActivity }: SummaryPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-4">
      <div className="rounded-[16px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-150 hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-lg">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{t('dashboard.summary.title')}</p>
          <h2 className="mt-2 text-[20px] font-semibold text-gray-50">{t('dashboard.summary.top_performers')}</h2>
          <p className="mt-2 text-sm text-gray-400">{t('dashboard.summary.key_highlights')}</p>
        </div>

        <div className="space-y-3">
          <SummaryCard {...topCustomer} />
          <SummaryCard {...topBranch} />
          <SummaryCard {...topDriver} />
        </div>
      </div>

      <div className="rounded-[16px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-150 hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-lg">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{t('dashboard.summary.recent_activity')}</p>
        <div className="mt-4 space-y-3">
          {recentActivity.map((item) => (
            <div key={item.label} className="rounded-[14px] border border-white/[0.06] bg-slate-950/50 p-4 transition-all duration-150 hover:border-sky-400/20 hover:bg-slate-900/70">
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="mt-2 text-[20px] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
