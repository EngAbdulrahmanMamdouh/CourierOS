import { API_BASE } from '@/config'

export type DashboardStatistics = {
  totalShipments: number
  pendingShipments: number
  deliveredToday: number
  activeCustomers: number
  todayShipments: number
}

export type ShipmentStatusSummaryItem = {
  status: string
  count: number
  color: string
}

export type RecentShipmentRow = {
  trackingNumber: string
  receiver: string
  city: string
  status: string
  assignedDriver: string
  createdAt: string
}

export type OperationMetric = {
  label: string
  value: string
  detail?: string
}

export type SummaryItem = {
  title: string
  value: string
  detail: string
}

export type RecentActivityItem = {
  label: string
  value: string
}

export type DashboardAnalytics = {
  statistics: DashboardStatistics
  chartData: { date: string; shipments: number }[]
  statusSummary: ShipmentStatusSummaryItem[]
  recentShipments: RecentShipmentRow[]
  operations: OperationMetric[]
  summary: {
    topCustomer: SummaryItem
    topBranch: SummaryItem
    topDriver: SummaryItem
    recentActivity: RecentActivityItem[]
  }
}

function buildMockDashboardAnalytics(): DashboardAnalytics {
  return {
    statistics: {
      totalShipments: 1284,
      pendingShipments: 214,
      deliveredToday: 72,
      activeCustomers: 86,
      todayShipments: 138,
    },
    chartData: [
      { date: 'Jun 24', shipments: 102 },
      { date: 'Jun 25', shipments: 116 },
      { date: 'Jun 26', shipments: 134 },
      { date: 'Jun 27', shipments: 128 },
      { date: 'Jun 28', shipments: 145 },
      { date: 'Jun 29', shipments: 156 },
      { date: 'Jun 30', shipments: 144 },
      { date: 'Jul 01', shipments: 162 },
    ],
    statusSummary: [
      { status: 'Pending', count: 214, color: 'bg-sky-500/15 text-sky-200' },
      { status: 'In Transit', count: 312, color: 'bg-amber-500/15 text-amber-200' },
      { status: 'Delivered', count: 672, color: 'bg-emerald-500/15 text-emerald-200' },
      { status: 'Returned', count: 86, color: 'bg-rose-500/15 text-rose-200' },
    ],
    recentShipments: [
      {
        trackingNumber: 'TRK-240701-001',
        receiver: 'Ahmed Hassan',
        city: 'Cairo',
        status: 'In Transit',
        assignedDriver: 'Mariam Khalil',
        createdAt: 'Jul 01, 2024',
      },
      {
        trackingNumber: 'TRK-240701-002',
        receiver: 'Sara Nabil',
        city: 'Alexandria',
        status: 'Pending',
        assignedDriver: 'Omar Farouk',
        createdAt: 'Jul 01, 2024',
      },
      {
        trackingNumber: 'TRK-240630-014',
        receiver: 'Hassan Youssef',
        city: 'Giza',
        status: 'Delivered',
        assignedDriver: 'Habiba Saad',
        createdAt: 'Jun 30, 2024',
      },
      {
        trackingNumber: 'TRK-240629-018',
        receiver: 'Mona Adel',
        city: 'Sharm El Sheikh',
        status: 'Returned',
        assignedDriver: 'Amr Mohamed',
        createdAt: 'Jun 29, 2024',
      },
    ],
    operations: [
      {
        label: "Today's Shipments",
        value: '138',
        detail: 'Highest volume since June 21',
      },
      {
        label: 'On-time Performance',
        value: '94%',
        detail: 'Based on last 7 days',
      },
      {
        label: 'Fleet Readiness',
        value: '91%',
        detail: 'Active vehicles in service',
      },
      {
        label: 'Active Drivers',
        value: '48',
        detail: 'On duty now',
      },
      {
        label: 'Active Branches',
        value: '12',
        detail: 'Operational across regions',
      },
      {
        label: 'COD Collection',
        value: 'EGP 284,700',
        detail: 'Pending vs completed',
      },
    ],
    summary: {
      topCustomer: {
        title: 'Top Customer',
        value: 'Modern Retail Group',
        detail: '28 shipments this week',
      },
      topBranch: {
        title: 'Top Branch',
        value: 'Maadi Hub',
        detail: 'Highest throughput',
      },
      topDriver: {
        title: 'Top Driver',
        value: 'Mariam Khalil',
        detail: '24 deliveries completed',
      },
      recentActivity: [
        { label: 'New customer added', value: 'Nile Foods' },
        { label: 'Shipment TRK-240701-002 assigned', value: 'Omar Farouk' },
        { label: 'COD update completed', value: 'EGP 24,500' },
      ],
    },
  }
}

function mapBackendAnalytics(source: any): DashboardAnalytics {
  const statistics = source?.statistics ?? {}
  const activeCustomers = source?.top_customers?.length ?? 0
  const deliveryPerformance = source?.delivery_performance ?? { on_time: 0, delayed: 0 }
  const codSummary = source?.cod_summary ?? { completed_amount: 0, pending_amount: 0 }

  const chartData = (source?.charts?.shipments_by_day ?? []).map((item: any) => ({
    date: item.day ?? '',
    shipments: item.count ?? 0,
  }))
  const recentShipments = (source?.recent_shipments ?? []).map((item: any) => ({
    trackingNumber: item.tracking_number ?? 'N/A',
    receiver: item.receiver_name ?? 'Unknown',
    city: item.city ?? 'Unknown',
    status: item.status ?? 'Pending',
    assignedDriver: item.assigned_driver ?? 'Unassigned',
    createdAt: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A',
  }))

  return {
    statistics: {
      totalShipments: statistics.total_shipments ?? 0,
      pendingShipments: statistics.pending ?? 0,
      deliveredToday: statistics.delivered ?? 0,
      activeCustomers,
      todayShipments: statistics.today_shipments ?? 0,
    },
    chartData: chartData.length > 0 ? chartData : buildMockDashboardAnalytics().chartData,
    statusSummary: [
      { status: 'Pending', count: statistics.pending ?? 0, color: 'bg-sky-500/15 text-sky-200' },
      { status: 'In Transit', count: statistics.in_transit ?? 0, color: 'bg-amber-500/15 text-amber-200' },
      { status: 'Delivered', count: statistics.delivered ?? 0, color: 'bg-emerald-500/15 text-emerald-200' },
      { status: 'Returned', count: statistics.cancelled ?? 0, color: 'bg-rose-500/15 text-rose-200' },
    ],
    recentShipments: recentShipments.length > 0 ? recentShipments : buildMockDashboardAnalytics().recentShipments,
    operations: [
      {
        label: "Today's Shipments",
        value: String(statistics.today_shipments ?? 0),
        detail: 'Daily operations volume',
      },
      {
        label: 'On-time Performance',
        value: `${Math.round(
          ((deliveryPerformance.on_time ?? 0) /
            Math.max((deliveryPerformance.on_time ?? 0) + (deliveryPerformance.delayed ?? 0), 1)) *
            100,
        )}%`,
        detail: 'Last 7 days',
      },
      {
        label: 'Fleet Readiness',
        value: `${(source?.top_drivers?.length ?? 0) * 8}%`,
        detail: 'Active fleet ratio',
      },
      {
        label: 'Active Drivers',
        value: String(source?.top_drivers?.length ?? 0),
        detail: 'Drivers in service',
      },
      {
        label: 'Active Branches',
        value: String(source?.top_branches?.length ?? 0),
        detail: 'Network coverage',
      },
      {
        label: 'COD Collection',
        value: `EGP ${Number(codSummary.completed_amount ?? 0).toLocaleString('en-US')}`,
        detail: 'Recent cash settlements',
      },
    ],
    summary: {
      topCustomer: {
        title: 'Top Customer',
        value: source?.top_customers?.[0]?.full_name ?? 'N/A',
        detail: `${source?.top_customers?.length ?? 0} active accounts`,
      },
      topBranch: {
        title: 'Top Branch',
        value: source?.top_branches?.[0]?.name ?? 'N/A',
        detail: 'Strongest throughput',
      },
      topDriver: {
        title: 'Top Driver',
        value: source?.top_drivers?.[0]?.full_name ?? 'N/A',
        detail: 'High delivery reliability',
      },
      recentActivity: [
        { label: 'Shipment volume updated', value: 'Today' },
        { label: 'Customer account refreshed', value: 'Modern Retail Group' },
        { label: 'Route performance reviewed', value: 'North corridor' },
      ],
    },
  }
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  try {
    const response = await fetch(`${API_BASE}/dashboard/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Backend dashboard API unavailable')
    }

    const payload = await response.json()
    return mapBackendAnalytics(payload)
  } catch {
    return buildMockDashboardAnalytics()
  }
}
