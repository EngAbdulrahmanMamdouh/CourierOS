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
    <section className="glass-card rounded-[24px] border-white/10 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Shipment analytics</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Daily shipment volume</h2>
        </div>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="shipmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
                borderRadius: 16,
                color: '#fff',
              }}
            />
            <Area type="monotone" dataKey="shipments" stroke="#38bdf8" strokeWidth={3} fill="url(#shipmentGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
