'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { fetchActiveCouriers } from '@/services/tracking'
import type { ActiveCourier } from '@/types/tracking'
import CourierMap from '@/components/tracking/CourierMap'
import CourierDetails from '@/components/tracking/CourierDetails'

export default function TrackingPage() {
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null)

  // Fetch active couriers with 10-second auto-refresh
  const { data: couriers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['activeCouriers'],
    queryFn: fetchActiveCouriers,
    refetchInterval: 10000,
    staleTime: 5000,
  })

  const selectedCourier =
    couriers.find((c) => c.courier_id === selectedCourierId) || null

  useEffect(() => {
    if (couriers.length > 0 && !selectedCourierId) {
      setSelectedCourierId(couriers[0].courier_id)
    }
  }, [couriers, selectedCourierId])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-[1600px] gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Operations</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Live Courier Tracking</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Real-time location updates for all active couriers. Data refreshes every 10 seconds.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">
            Loading courier locations…
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">
            Unable to load courier tracking data. {error instanceof Error ? error.message : 'Please try again.'}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CourierMap
                couriers={couriers}
                selectedCourierId={selectedCourierId}
                onSelectCourier={setSelectedCourierId}
              />
            </div>

            <div className="lg:col-span-1">
              <CourierDetails
                courier={selectedCourier}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
