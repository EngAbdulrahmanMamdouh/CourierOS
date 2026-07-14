"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { collectCod } from '@/services/finance'
import { fetchShipmentById } from '@/services/shipment'
import type { ShipmentResponse } from '@/types/shipment'
import StatusBadge from '@/components/shipments/StatusBadge'

export default function DashboardShipmentDetailsPage() {
  const params = useParams<{ id: string }>()
  const shipmentId = Number(params?.id)
  const [shipment, setShipment] = useState<ShipmentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectError, setCollectError] = useState<string | null>(null)
  const [codCollected, setCodCollected] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!shipmentId) {
      setError('Invalid shipment ID.')
      setIsLoading(false)
      return
    }

    let active = true

    async function loadShipment() {
      try {
        const result = await fetchShipmentById(shipmentId)
        if (active) {
          setShipment(result)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load shipment details.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadShipment()

    return () => {
      active = false
    }
  }, [shipmentId])

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/dashboard/shipments" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to shipments
        </Link>

        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-slate-400">Loading shipment…</div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">{error}</div>
        ) : shipment ? (
          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Shipment details</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">{shipment.receiver_name}</h1>
                <p className="mt-2 text-sm text-slate-400">Tracking: {shipment.tracking_number ?? `TRK-${shipment.id}`}</p>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h2 className="text-lg font-semibold text-white">Shipment info</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Shipment ID</dt><dd>{shipment.id}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Sender</dt><dd>{shipment.sender_name}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Receiver</dt><dd>{shipment.receiver_name}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Phone</dt><dd>{shipment.receiver_phone}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">City</dt><dd>{shipment.city}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd>{shipment.status}</dd></div>
                </dl>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-800/60 p-5">
                <h2 className="text-lg font-semibold text-white">Address & timing</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Address</dt><dd className="text-right">{shipment.address}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Created at</dt><dd>{new Date(shipment.created_at).toLocaleString()}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Updated at</dt><dd>{shipment.updated_at ? new Date(shipment.updated_at).toLocaleString() : '—'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">COD</dt><dd>{shipment.cod_amount != null ? `EGP ${shipment.cod_amount}` : '—'}</dd></div>
                </dl>
                {shipment.status === 'Delivered' && shipment.cod_amount && shipment.cod_amount > 0 && !codCollected ? (
                  <div className="mt-6">
                    <button
                      type="button"
                      disabled={isCollecting}
                      onClick={async () => {
                        if (!window.confirm(`Confirm collection of EGP ${shipment.cod_amount} COD for ${shipment.tracking_number ?? `shipment ${shipment.id}`}?`)) {
                          return
                        }

                        setCollectError(null)
                        setIsCollecting(true)
                        try {
                          await collectCod(shipment.id, {
                            amount_due: shipment.cod_amount,
                            cash_tendered: shipment.cod_amount,
                            change_due: 0,
                            transaction_reference: `COD-${shipment.id}-${Date.now()}`,
                            notes: 'Collected after delivery',
                          })
                          toast.success('COD collected successfully')
                          setCodCollected(true)
                          await queryClient.invalidateQueries({ queryKey: ['shipments'] })
                          await queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
                          const refreshed = await fetchShipmentById(shipment.id)
                          setShipment(refreshed)
                        } catch (error) {
                          const message = error instanceof Error ? error.message : 'Unable to collect COD.'
                          setCollectError(message)
                          toast.error(message)
                        } finally {
                          setIsCollecting(false)
                        }
                      }}
                      className="rounded-[16px] bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCollecting ? 'Collecting…' : 'Collect COD'}
                    </button>
                    {collectError ? <p className="mt-3 text-sm text-rose-400">{collectError}</p> : null}
                  </div>
                ) : null}
                {codCollected ? (
                  <div className="mt-6 rounded-[16px] bg-slate-800 px-4 py-3 text-sm font-semibold text-emerald-300">
                    COD has been collected successfully.
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
