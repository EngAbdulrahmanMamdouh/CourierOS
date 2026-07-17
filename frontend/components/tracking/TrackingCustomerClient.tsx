'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPublicTracking } from '@/services/tracking'
import type { PublicTrackingResponse } from '@/types/tracking'
import TrackingTimeline from './TrackingTimeline'

export default function TrackingCustomerClient() {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['publicTracking', search],
    queryFn: async () => {
      if (!search) throw new Error('No tracking number')
      return await fetchPublicTracking(search)
    },
    enabled: Boolean(search),
    retry: false,
    staleTime: 1000 * 60 * 2,
  })

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault()
    const t = input.trim()
    if (!t) return
    setSearch(t)
    // refetch will run because query key changed
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[18px] border border-white/6 bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">Track your shipment</h1>
          <p className="mt-2 text-sm text-slate-600">Enter a tracking number to see the shipment status and timeline.</p>

          <form onSubmit={handleTrack} className="mt-4 flex gap-2">
            <input
              aria-label="Tracking number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. TRK-240701-001"
              className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={handleTrack}
              type="submit"
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Track
            </button>
          </form>

          <div className="mt-6">
            {isLoading ? (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-6 text-slate-600">Loading tracking information…</div>
            ) : error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-6 text-rose-700">{(error as Error).message}</div>
            ) : data ? (
              <div className="space-y-4">
                <div className="rounded-md border border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Tracking Number</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">{data.tracking_number}</h2>
                      <p className="mt-1 text-sm text-slate-600">{data.company_name ?? ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">{data.status}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Receiver</p>
                      <p className="mt-1 font-medium text-slate-900">{data.receiver_name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">City</p>
                      <p className="mt-1 font-medium text-slate-900">{data.destination_city ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">COD Amount</p>
                      <p className="mt-1 font-medium text-slate-900">{data.cod_amount != null ? `EGP ${data.cod_amount.toFixed(2)}` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Created</p>
                      <p className="mt-1 font-medium text-slate-900">{data.created_at ?? data.created_date ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Delivered</p>
                      <p className="mt-1 font-medium text-slate-900">{data.delivered_at ?? '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">Shipment timeline</p>
                  <p className="mt-1 text-xs text-slate-500">Timeline built from shipment status history.</p>

                  <div className="mt-4">
                    <TrackingTimeline timeline={data.timeline} currentStatus={data.status} />
                  </div>
                </div>

              </div>
            ) : (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-6 text-slate-600">Enter a tracking number and click Track.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
