'use client'

import { useEffect, useMemo, useState } from 'react'
import FinanceChart from '@/components/finance/FinanceChart'
import FinanceStatCard from '@/components/finance/FinanceStatCard'
import { useFinanceHistory, useFinanceReports, useFinanceSummary } from '@/hooks/useFinanceQueries'
import { fetchDashboardAnalytics } from '@/services/dashboard'
import type { DashboardAnalytics } from '@/services/dashboard'
import { fetchShipmentReports } from '@/services/shipment'

type ShipmentReportsResponse = {
  total_shipments: number
  grouped_counts: Record<string, number>
  shipments: Array<{
    id: number
    receiver_name: string
    status: string
    city: string
    owner_id: number | null
  }>
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/50 p-4 text-sm text-slate-400">
      {message}
    </div>
  )
}

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString('en-US')}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export default function DashboardReportsPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useFinanceSummary()
  const { data: history, isLoading: historyLoading, error: historyError } = useFinanceHistory()
  const { data: reports, isLoading: reportsLoading, error: reportsError } = useFinanceReports()

  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null)
  const [shipmentReports, setShipmentReports] = useState<ShipmentReportsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadPageData() {
      try {
        const [dashboard, shipments] = await Promise.all([fetchDashboardAnalytics(), fetchShipmentReports()])
        if (active) {
          setDashboardData(dashboard)
          setShipmentReports(shipments)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load reports.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadPageData()

    return () => {
      active = false
    }
  }, [])

  const loading = summaryLoading || historyLoading || reportsLoading || isLoading
  const pageError = error || summaryError?.message || historyError?.message || reportsError?.message

  const statusItems = useMemo(() => {
    if (!shipmentReports?.grouped_counts) return []

    return Object.entries(shipmentReports.grouped_counts).map(([status, count]) => ({
      status,
      count,
    }))
  }, [shipmentReports])

  const revenueChartData = useMemo(() => {
    if (!summary) return []

    return [
      { label: 'Collected', value: summary.total_cod_collected },
      { label: 'Pending', value: summary.total_cod_pending },
      { label: 'Payments', value: summary.total_payments_received },
    ]
  }, [summary])

  const shipmentChartData = useMemo(() => {
    return statusItems.map((item) => ({ label: item.status, value: item.count }))
  }, [statusItems])

  const codChartData = useMemo(() => {
    if (!summary) return []

    return [
      { label: 'Due', value: summary.total_cod_due },
      { label: 'Collected', value: summary.total_cod_collected },
      { label: 'Pending', value: summary.total_cod_pending },
    ]
  }, [summary])

  const topCustomer = dashboardData?.summary?.topCustomer
  const topDriver = dashboardData?.summary?.topDriver

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[30px] border border-white/10 bg-slate-900/70 p-8 shadow-[0_32px_100px_rgba(2,6,23,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">CourierOS Reports</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Unified reports workspace</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">A single view for shipment performance, finance health, and operational leaders.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading reports…</div>
        ) : pageError ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{pageError}</div>
        ) : summary && reports && dashboardData && shipmentReports ? (
          <>
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Business Overview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Executive snapshot</h2>
                </div>
                <p className="text-sm text-slate-400">Generated {formatDate(reports.generated_at)}</p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FinanceStatCard title="Revenue" value={formatCurrency(summary.total_payments_received)} subtitle="Payments received" accent="#34d399" />
                <FinanceStatCard title="COD" value={formatCurrency(summary.total_cod_due)} subtitle="Cash due from deliveries" accent="#38bdf8" />
                <FinanceStatCard title="Outstanding" value={formatCurrency(summary.outstanding_balance)} subtitle="Pending balance" accent="#f59e0b" />
                <FinanceStatCard title="Shipments" value={shipmentReports.total_shipments.toLocaleString('en-US')} subtitle="Current report scope" accent="#fb7185" />
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-800/60 p-4">
                <FinanceChart title="Revenue" data={revenueChartData} />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shipment Analytics</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Status distribution</h3>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-800/60 p-4">
                  {shipmentChartData.length > 0 ? (
                    <FinanceChart title="Shipment status" data={shipmentChartData} />
                  ) : (
                    <EmptyState message="No shipment data available." />
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {statusItems.length > 0 ? (
                    statusItems.map((item) => (
                      <div key={item.status} className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                        <p className="text-sm font-medium text-slate-300">{item.status}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{item.count}</p>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2">
                      <EmptyState message="No shipment data available." />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Finance Analytics</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Cash movement overview</h3>
                <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-800/60 p-4">
                  {codChartData.length > 0 ? (
                    <FinanceChart title="COD summary" data={codChartData} />
                  ) : (
                    <EmptyState message="No finance data available." />
                  )}
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-400">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                    <span>Collected</span>
                    <span className="font-semibold text-white">{formatCurrency(summary.total_cod_collected)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                    <span>Pending</span>
                    <span className="font-semibold text-white">{formatCurrency(summary.total_cod_pending)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                    <span>Payments received</span>
                    <span className="font-semibold text-white">{formatCurrency(summary.total_payments_received)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                    <span>Today&apos;s shipments</span>
                    <span className="font-semibold text-white">{dashboardData.statistics.todayShipments}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top Customers</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Most active accounts</h3>
                <div className="mt-5 space-y-3">
                  {topCustomer?.value ? (
                    <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                      <p className="text-sm font-semibold text-white">{topCustomer.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{topCustomer.detail}</p>
                    </div>
                  ) : (
                    <EmptyState message="No customer statistics available." />
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top Drivers</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Highest performing couriers</h3>
                <div className="mt-5 space-y-3">
                  {topDriver?.value ? (
                    <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                      <p className="text-sm font-semibold text-white">{topDriver.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{topDriver.detail}</p>
                    </div>
                  ) : (
                    <EmptyState message="No driver statistics available." />
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent Finance Activity</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Latest transactions</h3>
              <div className="mt-5 space-y-3">
                {(history?.items ?? []).length > 0 ? (
                  (history?.items ?? []).slice(0, 6).map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                      <div>
                        <p className="text-sm font-medium text-white">{item.reference}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.notes ?? 'Finance event'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-cyan-400">{formatCurrency(item.amount)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No finance activity found." />
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}
