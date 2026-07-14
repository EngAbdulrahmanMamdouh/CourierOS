"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Package } from 'lucide-react'
import StatusBadge from '@/components/shipments/StatusBadge'
import { SHIPMENT_STATUS_OPTIONS } from '@/constants/shipment'
import { collectCod } from '@/services/finance'
import { updateShipmentStatus } from '@/services/shipment'
import type { ShipmentListItem } from '@/types/shipment'
import { toast } from 'sonner'

type ShipmentTableProps = {
  shipments: ShipmentListItem[]
  onCreateClick: () => void
  onStatusUpdated?: () => void
}

export default function ShipmentTable({ shipments, onCreateClick, onStatusUpdated }: ShipmentTableProps) {
  const queryClient = useQueryClient()
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [collectingId, setCollectingId] = useState<number | null>(null)
  const [collectedShipmentIds, setCollectedShipmentIds] = useState<number[]>([])

  const handleStatusChange = async (shipmentId: number, nextStatus: string) => {
    if (!nextStatus) {
      return
    }

    setUpdatingId(shipmentId)

    try {
      await updateShipmentStatus(shipmentId, nextStatus as ShipmentListItem['status'])
      toast.success('Shipment status updated')
      onStatusUpdated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update shipment status')
    } finally {
      setUpdatingId(null)
    }
  }
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live list</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recent shipments</h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCreateClick} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New shipment
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Tracking</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Receiver</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">City</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Status</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">COD</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">ETA</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No shipments available yet.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-200">
                        <Package className="h-4 w-4" />
                      </span>
                      <div>
                        <div>{shipment.tracking_number ?? `TRK-${shipment.id}`}</div>
                        <div className="text-xs text-slate-500">{shipment.sender_name}</div>
                        <Link href={`/dashboard/shipments/${shipment.id}`} className="mt-1 inline-flex text-xs font-semibold text-sky-400 transition hover:text-sky-300">
                          View details
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <div className="font-medium text-white">{shipment.receiver_name}</div>
                    <div className="text-xs text-slate-500">{shipment.receiver_phone}</div>
                  </td>
                  <td className="py-5 pr-6">{shipment.city}</td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={shipment.status} />
                    </div>
                  </td>
                  <td className="py-5 pr-6">{shipment.cod_amount != null ? `EGP ${shipment.cod_amount}` : '—'}</td>
                  <td className="py-5 pr-6">{shipment.estimated_delivery_days} days</td>
                  <td className="py-5 pr-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/dashboard/shipments/${shipment.id}`} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-slate-900/80 px-3 py-1 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40">
                        View Details
                      </Link>
                      <select
                        value={shipment.status}
                        disabled={updatingId === shipment.id}
                        onChange={(event) => handleStatusChange(shipment.id, event.target.value)}
                        className="rounded-[12px] border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                      >
                        {SHIPMENT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {shipment.status === 'Delivered' && shipment.cod_amount && shipment.cod_amount > 0 ? (
                        collectedShipmentIds.includes(shipment.id) ? (
                          <span className="inline-flex items-center rounded-[12px] bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-300">
                            COD collected
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={collectingId === shipment.id}
                            onClick={async () => {
                              if (!window.confirm(`Confirm collection of EGP ${shipment.cod_amount} COD for ${shipment.tracking_number ?? `shipment ${shipment.id}`}?`)) {
                                return
                              }

                              setCollectingId(shipment.id)

                              try {
                                await collectCod(shipment.id, {
                                  amount_due: shipment.cod_amount,
                                  cash_tendered: shipment.cod_amount,
                                  change_due: 0,
                                  transaction_reference: `COD-${shipment.id}-${Date.now()}`,
                                  notes: 'Collected after delivery',
                                })

                                toast.success('COD collected successfully')
                                setCollectedShipmentIds((prev) => [...prev, shipment.id])
                                await queryClient.invalidateQueries({ queryKey: ['shipments'] })
                                await queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
                                onStatusUpdated?.()
                              } catch (error) {
                                const message = error instanceof Error ? error.message : 'Unable to collect COD.'
                                toast.error(message)
                              } finally {
                                setCollectingId(null)
                              }
                            }}
                            className="inline-flex items-center gap-2 rounded-[12px] bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {collectingId === shipment.id ? 'Collecting…' : 'Collect COD'}
                          </button>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
