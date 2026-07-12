"use client"

import { useCourierSettlement } from '@/hooks/useFinanceQueries'

export default function CourierSettlementPage() {
  const { data: settlement, isLoading: loading, error } = useCourierSettlement(1)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8">
          <h1 className="text-3xl font-semibold text-white">Courier settlement</h1>
          <p className="mt-2 text-sm text-slate-400">Track COD amounts assigned to each courier and resolve pending settlements.</p>
        </div>

        {loading ? <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading settlement…</div> : error ? <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error instanceof Error ? error.message : 'Unable to load settlement.'}</div> : settlement ? (
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{settlement.driver_name}</h2>
                <p className="text-sm text-slate-400">Assigned COD settlement pipeline</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>Collected: <span className="text-emerald-400">EGP {settlement.total_collected.toLocaleString('en-US')}</span></p>
                <p>Pending: <span className="text-amber-400">EGP {settlement.total_pending.toLocaleString('en-US')}</span></p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {settlement.settlements.map((item) => (
                <div key={item.shipment_id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3 text-sm">
                  <span>Shipment #{item.shipment_id}</span>
                  <span className="text-slate-400">{item.customer_name ?? '—'}</span>
                  <span className={item.collected ? 'text-emerald-400' : 'text-amber-400'}>EGP {item.cod_amount.toLocaleString('en-US')}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
