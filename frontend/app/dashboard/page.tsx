import DashboardHeader from '@/components/dashboard/DashboardHeader'
import OperationsPanel from '@/components/dashboard/OperationsPanel'
import RecentShipmentsTable from '@/components/dashboard/RecentShipmentsTable'
import ShipmentChart from '@/components/dashboard/ShipmentChart'
import ShipmentStatusSummary from '@/components/dashboard/ShipmentStatusSummary'
import StatCard from '@/components/dashboard/StatCard'
import SummaryPanel from '@/components/dashboard/SummaryPanel'
import { getDashboardAnalytics } from '@/services/dashboard'

export default async function DashboardPage() {
  const data = await getDashboardAnalytics()
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-[1600px] gap-8">
        <DashboardHeader greeting="Good morning, Abdelrahman." dateLabel={dateLabel} />

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Shipments" value={String(data.statistics.totalShipments)} trend="Stable" subtitle="Active shipments in the network" />
          <StatCard title="Pending Shipments" value={String(data.statistics.pendingShipments)} trend="Tracking" subtitle="Shipments awaiting dispatch" />
          <StatCard title="Delivered Today" value={String(data.statistics.deliveredToday)} trend="Improving" subtitle="Deliveries completed so far" />
          <StatCard title="Active Customers" value={String(data.statistics.activeCustomers)} trend="Growing" subtitle="Customer accounts with active shipments" />
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
      </div>
    </main>
  )
}
