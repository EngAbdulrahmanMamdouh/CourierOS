type ShipmentStatusSummaryItem = {
  status: string
  count: number
  color: string
}

type ShipmentStatusSummaryProps = {
  items: ShipmentStatusSummaryItem[]
}

export default function ShipmentStatusSummary({ items }: ShipmentStatusSummaryProps) {
  return (
    <section className="glass-card rounded-[24px] border-white/10 p-5">
      <div className="mb-4">
        <div>
          <p className="text-sm text-slate-400">Status summary</p>
          <h2 className="mt-2 text-[1.25rem] font-semibold text-white">Shipment status</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.status} className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">{item.status}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}>
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-[2rem] font-bold text-white">{item.count}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
