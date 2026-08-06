"use client"

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import RouteGuard from '@/components/dashboard/RouteGuard'
import OperationsPanel from '@/components/dashboard/OperationsPanel'
import RecentShipmentsTable from '@/components/dashboard/RecentShipmentsTable'
import ShipmentChart from '@/components/dashboard/ShipmentChart'
import ShipmentStatusSummary from '@/components/dashboard/ShipmentStatusSummary'
import StatCard from '@/components/dashboard/StatCard'
import SummaryPanel from '@/components/dashboard/SummaryPanel'
import { getDashboardAnalytics } from '@/services/dashboard'
import type { DashboardAnalytics } from '@/services/dashboard'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [dateLabel, setDateLabel] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const result = await getDashboardAnalytics()
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

    setIsMounted(true)
    setDateLabel(
      new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date())
    )
    loadDashboard()

    return () => {
      active = false
    }
  }, [i18n.language])

  const resolvedDateLabel = isMounted ? dateLabel : ''

 
  return (
  <RouteGuard>
  <main className="min-h-screen bg-slate-950 px-4 py-4 sm:px-6 lg:px-6 lg:py-6">
    <div className="mx-auto flex w-full max-w-[1600px] gap-6">

      <DashboardSidebar />

      <div className="flex-1 space-y-6">
        <DashboardHeader greeting={t('dashboard.greeting_morning', { name: 'Abdelrahman' })} dateLabel={resolvedDateLabel} />

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">{t('dashboard.loading_dashboard_statistics')}</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : data ? (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard titleKey="dashboard.cards.total_shipments.title" value={String(data.statistics.totalShipments)} trendKey="dashboard.trends.stable" subtitleKey="dashboard.cards.total_shipments.subtitle" />
              <StatCard titleKey="dashboard.cards.pending_shipments.title" value={String(data.statistics.pendingShipments)} trendKey="dashboard.trends.tracking" subtitleKey="dashboard.cards.pending_shipments.subtitle" />
              <StatCard titleKey="dashboard.cards.in_transit.title" value={String(data.statistics.inTransitShipments)} trendKey="dashboard.trends.moving" subtitleKey="dashboard.cards.in_transit.subtitle" />
              <StatCard titleKey="dashboard.cards.delivered.title" value={String(data.statistics.deliveredShipments)} trendKey="dashboard.trends.delivered" subtitleKey="dashboard.cards.delivered.subtitle" />
              <StatCard titleKey="dashboard.cards.cancelled.title" value={String(data.statistics.cancelledShipments)} trendKey="dashboard.trends.risk" subtitleKey="dashboard.cards.cancelled.subtitle" />
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
