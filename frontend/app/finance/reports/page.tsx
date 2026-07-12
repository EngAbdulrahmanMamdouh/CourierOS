"use client"

import { useFinanceReports } from '@/hooks/useFinanceQueries'

export default function FinanceReportsPage() {
  const { data: reports, isLoading: loading, error } = useFinanceReports()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8">
          <h1 className="text-3xl font-semibold text-white">Finance reports</h1>
          <p className="mt-2 text-sm text-slate-400">Exportable summary and cash activity snapshot for operations and finance teams.</p>
        </div>

        {loading ? <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading reports…</div> : error ? <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error instanceof Error ? error.message : 'Unable to load reports.'}</div> : reports ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Summary snapshot</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <div className="flex justify-between"><span>Total COD due</span><span className="text-white">EGP {reports.summary.total_cod_due.toLocaleString('en-US')}</span></div>
                <div className="flex justify-between"><span>Collected</span><span className="text-white">EGP {reports.summary.total_cod_collected.toLocaleString('en-US')}</span></div>
                <div className="flex justify-between"><span>Pending</span><span className="text-white">EGP {reports.summary.total_cod_pending.toLocaleString('en-US')}</span></div>
                <div className="flex justify-between"><span>Outstanding</span><span className="text-cyan-400">EGP {reports.summary.outstanding_balance.toLocaleString('en-US')}</span></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold text-white">Generated report</h3>
              <p className="mt-2 text-sm text-slate-400">Generated at {new Date(reports.generated_at).toLocaleString('en-US')}</p>
              <div className="mt-4 space-y-2">
                {(reports.history.items ?? []).slice(0, 8).map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3 text-sm">
                    <span>{item.reference}</span>
                    <span className="text-cyan-400">EGP {item.amount.toLocaleString('en-US')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
