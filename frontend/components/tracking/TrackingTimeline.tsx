'use client'

import type { TimelineItem } from '@/types/tracking'

const STATUS_ORDER = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled']

type Props = {
  timeline: TimelineItem[]
  currentStatus?: string
}

export default function TrackingTimeline({ timeline, currentStatus }: Props) {
  // Build a map of status -> changed_at
  const map = new Map<string, string | null>()
  timeline.forEach((t) => map.set(t.status, t.changed_at ?? null))

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((status) => {
        const ts = map.get(status) ?? null
        const isActive = currentStatus === status
        return (
          <div key={status} className="flex items-start gap-4">
            <div className="flex h-4 w-4 items-center justify-center">
              <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-sky-600' : ts ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">{status}</div>
                <div className="text-xs text-slate-500">{ts ?? '—'}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
