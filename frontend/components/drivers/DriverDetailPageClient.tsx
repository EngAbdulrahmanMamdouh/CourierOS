"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { fetchDriverById } from '@/services/driver'
import type { DriverResponse } from '@/types/driver'

export default function DriverDetailPageClient() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const [driver, setDriver] = useState<DriverResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setError('Invalid driver ID.')
      setIsLoading(false)
      return
    }

    let active = true

    async function loadDriver() {
      try {
        const result = await fetchDriverById(id)
        if (active) {
          setDriver(result)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load driver details.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadDriver()

    return () => {
      active = false
    }
  }, [id])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/dashboard/drivers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to drivers
        </Link>

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading driver…</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : driver ? (
          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Driver details</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">{driver.full_name}</h1>
                <p className="mt-2 text-sm text-slate-400">{driver.branch_name ?? 'Unassigned branch'}</p>
              </div>
              <div className="rounded-full bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100">{driver.status}</div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h2 className="text-lg font-semibold text-white">Personal info</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Phone</dt><dd>{driver.phone}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd>{driver.email ?? '—'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">National ID</dt><dd>{driver.national_id}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Availability</dt><dd>{driver.availability}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Active</dt><dd>{driver.is_active ? 'Yes' : 'No'}</dd></div>
                </dl>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h2 className="text-lg font-semibold text-white">Vehicle details</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Vehicle</dt><dd>{driver.vehicle_type}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Plate</dt><dd>{driver.vehicle_plate}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">License</dt><dd>{driver.license_number}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">License expiry</dt><dd>{driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : '—'}</dd></div>
                </dl>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Assigned</h3>
                <p className="mt-3 text-3xl font-bold text-white">{driver.assigned_shipments_count}</p>
                <p className="mt-2 text-sm text-slate-400">Shipments assigned</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Pending</h3>
                <p className="mt-3 text-3xl font-bold text-white">{driver.pending_deliveries_count}</p>
                <p className="mt-2 text-sm text-slate-400">Pending deliveries</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Delivered today</h3>
                <p className="mt-3 text-3xl font-bold text-white">{driver.delivered_today_count}</p>
                <p className="mt-2 text-sm text-slate-400">Completed deliveries</p>
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Driver not found.</div>
        )}
      </div>
    </main>
  )
}
