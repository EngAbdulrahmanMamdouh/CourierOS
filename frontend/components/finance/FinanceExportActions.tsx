type FinanceExportActionsProps = {
  onExportCsv: () => void
  onExportPdf: () => void
}

export default function FinanceExportActions({ onExportCsv, onExportPdf }: FinanceExportActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onExportCsv}
        className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={onExportPdf}
        className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
      >
        Download PDF
      </button>
    </div>
  )
}
