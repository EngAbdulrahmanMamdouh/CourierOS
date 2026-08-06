'use client'

import { useTranslation } from 'react-i18next'

type ShipmentStatusSummaryItem = {
  status: string
  count: number
  color: string
}

type ShipmentStatusSummaryProps = {
  items: ShipmentStatusSummaryItem[]
}

export default function ShipmentStatusSummary({ items }: ShipmentStatusSummaryProps) {
  const { t } = useTranslation()

  const getToneClasses = (color: string) => {
    if (color.includes('emerald') || color.includes('green')) {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20'
    }

    if (color.includes('amber') || color.includes('yellow')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-400/20'
    }

    if (color.includes('rose') || color.includes('red')) {
      return 'bg-rose-500/10 text-rose-300 border-rose-400/20'
    }

    return 'bg-sky-500/10 text-sky-300 border-sky-400/20'
  }

  return (
    <section className="rounded-[16px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-200 hover:-translate-y-[2px] hover:border-white/[0.16] hover:shadow-lg">
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{t('dashboard.status_summary')}</p>
        <h2 className="mt-2 text-[20px] font-semibold text-gray-50">{t('dashboard.shipment_status')}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.status}
            className="rounded-[14px] border border-white/[0.06] bg-slate-950/50 p-4 transition-all duration-200 hover:bg-slate-900/70"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-400">{
                item.status === 'Pending'
                  ? t('status.shipments.pending')
                  : item.status === 'In Transit'
                    ? t('status.shipments.in_transit')
                    : item.status === 'Delivered'
                      ? t('status.shipments.delivered')
                      : item.status === 'Cancelled'
                        ? t('status.shipments.cancelled')
                        : item.status === 'Returned'
                          ? t('status.shipments.returned')
                          : item.status
              }</p>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getToneClasses(item.color)}`}>
                {item.status === 'Pending'
                  ? t('status.shipments.pending')
                  : item.status === 'In Transit'
                    ? t('status.shipments.in_transit')
                    : item.status === 'Delivered'
                      ? t('status.shipments.delivered')
                      : item.status === 'Cancelled'
                        ? t('status.shipments.cancelled')
                        : item.status === 'Returned'
                          ? t('status.shipments.returned')
                          : item.status}
              </span>
            </div>
            <p className="mt-4 text-[2rem] font-bold leading-none text-white">{item.count}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
