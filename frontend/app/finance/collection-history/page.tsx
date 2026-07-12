"use client"

import { useFinanceHistory } from '@/hooks/useFinanceQueries'

export default function CollectionHistoryPage() {
  const { data: history, isLoading: loading, error } = useFinanceHistory()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8">
          <h1 className="text-3xl font-semibold text-white">Collection history</h1>
          <p className="mt-2 text-sm text-slate-400">Review the latest COD collections and payment transactions.</p>
        </div>

        {loading ? <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading history…</div> : error ? <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error instanceof Error ? error.message : 'Unable to load history.'}</div> : (
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="space-y-2">
              {(history?.items ?? []).map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3 text-sm">
                  <div>
                    <p className="font-medium text-white">{item.reference}</p>
                    <p className="text-slate-500">{item.notes ?? 'Finance event'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400">EGP {item.amount.toLocaleString('en-US')}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
