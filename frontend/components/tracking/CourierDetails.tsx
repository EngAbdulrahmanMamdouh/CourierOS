'use client'

import { useEffect, useState } from 'react'
import { Battery, Clock, Zap, TrendingUp } from 'lucide-react'
import type { ActiveCourier, CourierLocationHistory } from '@/types/tracking'
import { fetchCourierHistory } from '@/services/tracking'

type CourierDetailsProps = {
  courier: ActiveCourier | null
  isLoading?: boolean
}

export default function CourierDetails({ courier, isLoading = false }: CourierDetailsProps) {
  const [history, setHistory] = useState<CourierLocationHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!courier) {
      setHistory([])
      return
    }

    async function loadHistory() {
      setHistoryLoading(true)
      try {
        const data = await fetchCourierHistory(courier.courier_id, 24)
        setHistory(data)
      } catch (error) {
        console.error('Failed to load courier history:', error)
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [courier?.courier_id])

  if (!courier) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-center text-slate-400">Select a courier to view details</p>
      </div>
    )
  }

  const lastUpdateTime = new Date(courier.last_update)
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000)
  const timeSinceUpdateStr =
    timeSinceUpdate < 60
      ? `${timeSinceUpdate}s ago`
      : timeSinceUpdate < 3600
        ? `${Math.floor(timeSinceUpdate / 60)}m ago`
        : `${Math.floor(timeSinceUpdate / 3600)}h ago`

  // Calculate distance traveled
  let distanceTraveled = 0
  if (history.length > 1) {
    for (let i = 1; i < history.length; i++) {
      const lat1 = history[i].latitude
      const lon1 = history[i].longitude
      const lat2 = history[i - 1].latitude
      const lon2 = history[i - 1].longitude

      const R = 6371 // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      distanceTraveled += R * c
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Courier details</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{courier.courier_name}</h2>
            <p className="mt-1 text-sm text-slate-400">Updated {timeSinceUpdateStr}</p>
          </div>
          {courier.battery_level !== null && (
            <div
              className="flex flex-col items-center gap-2 rounded-[16px] px-4 py-3"
              style={{
                backgroundColor:
                  courier.battery_level > 30 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(248, 113, 113, 0.1)',
              }}
            >
              <Battery
                className="h-5 w-5"
                style={{
                  color: courier.battery_level > 30 ? '#10b981' : '#f87171',
                }}
              />
              <span
                style={{
                  color: courier.battery_level > 30 ? '#10b981' : '#f87171',
                  fontWeight: 600,
                }}
              >
                {Math.round(courier.battery_level)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[16px] border border-white/10 bg-slate-800/60 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Current location</p>
          <p className="mt-3 font-mono text-sm text-white">
            {courier.latitude.toFixed(6)}, {courier.longitude.toFixed(6)}
          </p>
          {courier.accuracy && (
            <p className="mt-2 text-xs text-slate-400">Accuracy: ±{courier.accuracy.toFixed(1)}m</p>
          )}
        </div>

        <div className="rounded-[16px] border border-white/10 bg-slate-800/60 p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-slate-400" />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Speed</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{courier.speed.toFixed(1)}</p>
          <p className="text-xs text-slate-400">km/h</p>
        </div>

        <div className="rounded-[16px] border border-white/10 bg-slate-800/60 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Distance traveled</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{distanceTraveled.toFixed(2)}</p>
          <p className="text-xs text-slate-400">km (last 24h)</p>
        </div>

        <div className="rounded-[16px] border border-white/10 bg-slate-800/60 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Heading</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{Math.round(courier.heading)}°</p>
          <p className="text-xs text-slate-400">
            {getHeadingDirection(courier.heading)}
          </p>
        </div>
      </div>

      {courier.shipment_id && (
        <div className="mt-6 rounded-[16px] border border-sky-400/20 bg-sky-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Current delivery</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{courier.shipment_receiver}</p>
              <p className="mt-1 text-xs text-slate-400">Shipment #{courier.shipment_id}</p>
            </div>
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: getStatusColor(courier.shipment_status).bg,
                color: getStatusColor(courier.shipment_status).text,
              }}
            >
              {courier.shipment_status}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Route history</p>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {historyLoading ? (
            <p className="text-xs text-slate-400">Loading history...</p>
          ) : history.length > 0 ? (
            history.slice(0, 10).map((point, idx) => (
              <div key={point.id} className="rounded-[12px] border border-white/5 bg-slate-800/40 px-3 py-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-slate-300">
                      {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                    </p>
                    <p className="mt-1 text-slate-500">{new Date(point.created_at).toLocaleTimeString()}</p>
                  </div>
                  <span className="text-slate-400">{point.speed.toFixed(1)} km/h</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No history available</p>
          )}
        </div>
      </div>
    </div>
  )
}

function getHeadingDirection(heading: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(heading / 22.5) % 16
  return directions[index]
}

function getStatusColor(status: string | null): { bg: string; text: string } {
  switch (status) {
    case 'Delivered':
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#86efac' }
    case 'In Transit':
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd' }
    case 'Pending':
      return { bg: 'rgba(56, 189, 248, 0.15)', text: '#7dd3fc' }
    case 'Cancelled':
      return { bg: 'rgba(248, 113, 113, 0.15)', text: '#fca5a5' }
    default:
      return { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1' }
  }
}
