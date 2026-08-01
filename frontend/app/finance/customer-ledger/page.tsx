"use client"

import { useCustomerLedger } from '@/hooks/useFinanceQueries'

export default function CustomerLedgerPage() {
  const { data: ledger, isLoading: loading, error } = useCustomerLedger(1)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8">
          <h1 className="text-3xl font-semibold text-white">Customer ledger</h1>
          <p className="mt-2 text-sm text-slate-400">Review COD exposure and payment activity for each customer.</p>
        </div>

        {loading ? <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading ledger…</div> : error ? <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error instanceof Error ? error.message : 'Unable to load ledger.'}</div> : ledger ? (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">{ledger.customer_name}</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <div className="flex justify-between"><span>Total COD due</span><span className="text-white">EGP {ledger.total_cod_due.toLocaleString('en-US')}</span></div>
                <div className="flex justify-between"><span>Total payments</span><span className="text-white">EGP {ledger.total_payments.toLocaleString('en-US')}</span></div>
                <div className="flex justify-between"><span>Outstanding</span><span className="text-cyan-400">EGP {ledger.outstanding_balance.toLocaleString('en-US')}</span></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold text-white">Shipment history</h3>
              <div className="mt-4 space-y-2">
                {ledger.shipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3 text-sm">
                    <span>{shipment.tracking_number ?? `#${shipment.id}`}</span>
                    <span className="text-slate-400">{shipment.status}</span>
                    <span className="text-white">COD: EGP {shipment.cod_amount.toLocaleString('en-US')} • Shipping: {shipment.shipping_price != null ? `EGP ${Number(shipment.shipping_price).toFixed(2)}` : '—'}</span>
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
