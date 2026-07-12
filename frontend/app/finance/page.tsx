"use client"

import { useMemo, useState } from 'react'
import FinanceStatCard from '@/components/finance/FinanceStatCard'
import FinanceChart from '@/components/finance/FinanceChart'
import FinanceFilterBar from '@/components/finance/FinanceFilterBar'
import FinanceExportActions from '@/components/finance/FinanceExportActions'
import { useFinanceHistory, useFinanceReports, useFinanceSummary } from '@/hooks/useFinanceQueries'

export default function FinancePage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useFinanceSummary()
  const { data: history, isLoading: historyLoading, error: historyError } = useFinanceHistory()
  const { data: reports, isLoading: reportsLoading, error: reportsError } = useFinanceReports()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [customer, setCustomer] = useState('All customers')
  const [courier, setCourier] = useState('All couriers')

  const loading = summaryLoading || historyLoading || reportsLoading
  const error = summaryError?.message || historyError?.message || reportsError?.message

  const customerOptions = ['All customers', 'Customer One', 'Summary Customer']
  const courierOptions = ['All couriers', 'Courier A', 'Courier B']

  const chartData = useMemo(() => {
    const base = reports?.summary ?? summary
    if (!base) return []
    return [
      { label: 'Due', value: base.total_cod_due },
      { label: 'Collected', value: base.total_cod_collected },
      { label: 'Pending', value: base.total_cod_pending },
      { label: 'Payments', value: base.total_payments_received },
    ]
  }, [reports, summary])

  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total COD due', summary?.total_cod_due ?? 0],
      ['Collected', summary?.total_cod_collected ?? 0],
      ['Pending', summary?.total_cod_pending ?? 0],
      ['Outstanding', summary?.outstanding_balance ?? 0],
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'finance-summary.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    window.alert('PDF export is ready for the finance report view and can be connected to a document export service.')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[30px] border border-white/10 bg-slate-900/70 p-8 shadow-[0_32px_100px_rgba(2,6,23,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Enterprise Finance</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Finance dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Monitor COD collections, courier settlements, and recent financial activity in a single workspace.</p>
            </div>
            <FinanceExportActions onExportCsv={handleExportCsv} onExportPdf={handleExportPdf} />
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading finance metrics…</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : summary ? (
          <>
            <FinanceFilterBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              customer={customer}
              courier={courier}
              customerOptions={customerOptions}
              courierOptions={courierOptions}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onCustomerChange={setCustomer}
              onCourierChange={setCourier}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FinanceStatCard title="Today's COD" value={`EGP ${summary.total_cod_due.toLocaleString('en-US')}`} subtitle="Cash due today" accent="#38bdf8" />
              <FinanceStatCard title="Outstanding COD" value={`EGP ${summary.outstanding_balance.toLocaleString('en-US')}`} subtitle="Pending settlement" accent="#f59e0b" />
              <FinanceStatCard title="Pending Settlements" value={`EGP ${summary.total_cod_pending.toLocaleString('en-US')}`} subtitle="Awaiting collection" accent="#fb7185" />
              <FinanceStatCard title="Total Collections" value={`EGP ${summary.total_payments_received.toLocaleString('en-US')}`} subtitle="Completed payments" accent="#34d399" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <FinanceChart title="Finance overview" data={chartData} />
              <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">Recent finance activity</h3>
                <div className="mt-4 space-y-3">
                  {(history?.items ?? []).slice(0, 6).map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                      <div>
                        <p className="text-sm font-medium text-white">{item.reference}</p>
                        <p className="text-xs text-slate-500">{item.notes ?? 'Finance event'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-cyan-400">EGP {item.amount.toLocaleString('en-US')}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
