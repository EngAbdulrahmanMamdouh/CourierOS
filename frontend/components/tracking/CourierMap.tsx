'use client'

import { useEffect, useState } from 'react'
import { MapPin, Battery, Zap } from 'lucide-react'
import type { ActiveCourier } from '@/types/tracking'

type CourierMapProps = {
  couriers: ActiveCourier[]
  selectedCourierId?: number | null
  onSelectCourier?: (courierId: number | null) => void
}

export default function CourierMap({
  couriers,
  selectedCourierId,
  onSelectCourier,
}: CourierMapProps) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)

  // Calculate bounds
  const bounds = {
    minLat: Math.min(...couriers.map((c) => c.latitude)),
    maxLat: Math.max(...couriers.map((c) => c.latitude)),
    minLng: Math.min(...couriers.map((c) => c.longitude)),
    maxLng: Math.max(...couriers.map((c) => c.longitude)),
  }

  const padding = 0.001
  const latRange = bounds.maxLat - bounds.minLat || 0.01
  const lngRange = bounds.maxLng - bounds.minLng || 0.01

  useEffect(() => {
    if (!canvasRef || couriers.length === 0) return

    const canvas = canvasRef
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Draw background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.moveTo((i / 10) * width, 0)
      ctx.lineTo((i / 10) * width, height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, (i / 10) * height)
      ctx.lineTo(width, (i / 10) * height)
      ctx.stroke()
    }

    // Draw couriers
    couriers.forEach((courier) => {
      const x = ((courier.longitude - bounds.minLng) / lngRange) * width
      const y = ((bounds.maxLat - courier.latitude) / latRange) * height

      const isSelected = courier.courier_id === selectedCourierId

      // Draw dot
      ctx.fillStyle = isSelected ? '#38bdf8' : '#10b981'
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2)
      ctx.fill()

      // Draw outer ring if selected
      if (isSelected) {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw heading line
      const headingRad = (courier.heading * Math.PI) / 180
      const lineLength = 15
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#10b981'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.sin(headingRad) * lineLength, y - Math.cos(headingRad) * lineLength)
      ctx.stroke()
    })

    // Draw title
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '12px sans-serif'
    ctx.fillText(`${couriers.length} active couriers`, 10, 20)
  }, [canvasRef, couriers, selectedCourierId])

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live map</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Courier positions</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
            {couriers.length} online
          </div>
        </div>
      </div>

      <div className="relative mb-6 h-96 rounded-[18px] border border-white/10 bg-slate-950/80">
        <canvas
          ref={setCanvasRef}
          width={800}
          height={384}
          className="h-full w-full rounded-[18px]"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            const scaledX = (x / rect.width) * e.currentTarget.width
            const scaledY = (y / rect.height) * e.currentTarget.height

            // Find clicked courier
            couriers.forEach((courier) => {
              const cX =
                ((courier.longitude - bounds.minLng) / lngRange) *
                e.currentTarget.width
              const cY =
                ((bounds.maxLat - courier.latitude) / latRange) *
                e.currentTarget.height

              const distance = Math.sqrt((scaledX - cX) ** 2 + (scaledY - cY) ** 2)
              if (distance < 15) {
                onSelectCourier?.(courier.courier_id)
              }
            })
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {couriers.length > 0 ? (
          couriers.map((courier) => (
            <button
              key={courier.courier_id}
              onClick={() => onSelectCourier?.(courier.courier_id)}
              className={`rounded-[18px] border p-4 text-left transition ${
                selectedCourierId === courier.courier_id
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-white/10 bg-slate-800/60 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-white">{courier.courier_name}</p>
                  {courier.shipment_receiver && (
                    <p className="mt-1 text-xs text-slate-400">
                      Delivering to: {courier.shipment_receiver}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {courier.latitude.toFixed(4)}, {courier.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <Zap className="h-3 w-3" />
                    <span>{courier.speed.toFixed(1)} km/h</span>
                  </div>
                </div>
                {courier.battery_level !== null && (
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className="flex items-center gap-1 rounded-full px-2 py-1"
                      style={{
                        backgroundColor:
                          courier.battery_level > 30
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(248, 113, 113, 0.1)',
                      }}
                    >
                      <Battery className="h-3 w-3" />
                      <span
                        style={{
                          color:
                            courier.battery_level > 30 ? '#10b981' : '#f87171',
                        }}
                      >
                        {Math.round(courier.battery_level)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-2 rounded-[16px] border border-white/10 bg-slate-800/60 p-8 text-center text-slate-400">
            No active couriers right now.
          </div>
        )}
      </div>
    </div>
  )
}
