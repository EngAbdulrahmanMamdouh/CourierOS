'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartPoint = {
  date: string
  shipments: number
}

type ShipmentChartProps = {
  data: ChartPoint[]
}

export default function ShipmentChart({ data }: ShipmentChartProps) {
  return (
    <section className="glass-card overflow-hidden p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Shipment analytics</p>
          <h2 className="mt-2 text-[20px] font-semibold text-white">Daily shipment volume</h2>
          <p className="mt-2 text-sm text-gray-400">Performance trend across the most recent shipment activity.</p>
        </div>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 8 }}>
            <defs>
              <linearGradient id="shipmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.75} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={36}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(56, 189, 248, 0.35)', strokeWidth: 1 }}
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: 14,
                color: '#fff',
                boxShadow: '0 10px 30px rgba(2, 6, 23, 0.35)',
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Area
              type="monotone"
              dataKey="shipments"
              stroke="#38bdf8"
              strokeWidth={3}
              fill="url(#shipmentGradient)"
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}