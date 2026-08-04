"use client"

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import RouteGuard from '@/components/dashboard/RouteGuard'
import OperationsPanel from '@/components/dashboard/OperationsPanel'
import RecentShipmentsTable from '@/components/dashboard/RecentShipmentsTable'
import ShipmentChart from '@/components/dashboard/ShipmentChart'
import ShipmentStatusSummary from '@/components/dashboard/ShipmentStatusSummary'
import StatCard from '@/components/dashboard/StatCard'
import SummaryPanel from '@/components/dashboard/SummaryPanel'
import { fetchDashboardAnalytics } from '@/services/dashboard'
import type { DashboardAnalytics } from '@/services/dashboard'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const result = await fetchDashboardAnalytics()
        if (active) {
          setData(result)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

 
  return (
  <RouteGuard>
  <main className="min-h-screen bg-slate-950 px-4 py-4 sm:px-6 lg:px-6 lg:py-6">
    <div className="mx-auto flex w-full max-w-[1600px] gap-6">

      <DashboardSidebar />

      <div className="flex-1 space-y-6">
        <DashboardHeader greeting="Good morning, Abdelrahman." dateLabel={dateLabel} />

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading dashboard statistics…</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : data ? (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard title="Total Shipments" value={String(data.statistics.totalShipments)} trend="Stable" subtitle="Active shipments in the network" />
              <StatCard title="Pending Shipments" value={String(data.statistics.pendingShipments)} trend="Tracking" subtitle="Shipments awaiting dispatch" />
              <StatCard title="In Transit" value={String(data.statistics.inTransitShipments)} trend="Moving" subtitle="Shipments currently on the road" />
              <StatCard title="Delivered Shipments" value={String(data.statistics.deliveredShipments)} trend="Delivered" subtitle="Shipments completed successfully" />
              <StatCard title="Cancelled Shipments" value={String(data.statistics.cancelledShipments)} trend="Risk" subtitle="Shipments that were cancelled" />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[0.7fr_0.3fr]">
              <ShipmentChart data={data.chartData} />
              <ShipmentStatusSummary items={data.statusSummary} />
            </div>

            <RecentShipmentsTable shipments={data.recentShipments} />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[0.7fr_0.3fr]">
              <OperationsPanel operations={data.operations} />
              <SummaryPanel
                topCustomer={data.summary.topCustomer}
                topBranch={data.summary.topBranch}
                topDriver={data.summary.topDriver}
                recentActivity={data.summary.recentActivity}
              />
            </div>
          </>
        ) : null}
        </div>
      </div>
    </main>
  </RouteGuard>
  )

  
}
