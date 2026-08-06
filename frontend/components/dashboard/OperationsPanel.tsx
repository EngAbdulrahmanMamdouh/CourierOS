'use client'

import { useTranslation } from 'react-i18next'

type OperationMetric = {
  label: string
  value: string
  detail?: string
}

type OperationsPanelProps = {
  operations: OperationMetric[]
}

export default function OperationsPanel({ operations }: OperationsPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="rounded-[16px] border border-white/[0.08] bg-[rgba(17,24,39,0.75)] p-6 backdrop-blur transition-all duration-150 hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-lg">
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{t('dashboard.operations_panel.title')}</p>
        <h2 className="mt-2 text-[20px] font-semibold text-gray-50">{t('dashboard.operations_panel.heading')}</h2>
        <p className="mt-2 text-sm text-gray-400">{t('dashboard.operations_panel.description')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {operations.map((operation) => (
          <div
            key={operation.label}
            className="rounded-[14px] border border-white/[0.06] bg-slate-950/50 p-4 transition-all duration-150 hover:-translate-y-[1px] hover:border-sky-400/20 hover:bg-slate-900/70"
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-gray-400">{operation.label}</p>
            <p className="mt-3 text-[28px] font-bold leading-none text-white">{operation.value}</p>
            {operation.detail ? <p className="mt-2 text-sm text-gray-500">{operation.detail}</p> : null}
          </div>
        ))}
      </div>
    </section>
  )
}
