type OperationMetric = {
  label: string
  value: string
  detail?: string
}

type OperationsPanelProps = {
  operations: OperationMetric[]
}

export default function OperationsPanel({ operations }: OperationsPanelProps) {
  return (
    <section className="glass-card rounded-[24px] border-white/10 p-5">
      <div className="mb-4">
        <p className="text-sm text-slate-400">Operations panel</p>
        <h2 className="mt-2 text-[1.25rem] font-semibold text-white">Operational performance</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {operations.map((operation) => (
          <div key={operation.label} className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-[0.95rem] font-medium text-slate-400">{operation.label}</p>
            <p className="mt-3 text-[2rem] font-bold text-white">{operation.value}</p>
            {operation.detail ? <p className="mt-2 text-[0.95rem] text-slate-500">{operation.detail}</p> : null}
          </div>
        ))}
      </div>
    </section>
  )
}
