'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Download, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { downloadShipmentTemplate, previewShipmentImport, executeShipmentImport } from '@/services/shipment'

type ImportStep = 'upload' | 'preview' | 'executing' | 'results'

interface PreviewRow {
  row_number: number
  validation_status: 'valid' | 'invalid'
  validation_errors: string[]
  mapped_data: Record<string, any>
}

interface ImportResult {
  total_rows: number
  successful_rows: number
  failed_rows: number
  duplicate_rows: number
  validation_errors: Array<{
    row_number: number
    errors: string[]
    mapped_data: Record<string, any>
  }>
  created_shipment_ids: number[]
  execution_time: number
  import_job_id: number
}

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: (result: ImportResult) => void
}

export default function ImportExcelDialog({ open, onClose, onSuccess }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<{
    detected_columns: string[]
    missing_required_columns: string[]
    preview_rows: PreviewRow[]
    total_rows: number
  } | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [expandedErrorRow, setExpandedErrorRow] = useState<number | null>(null)
  const { t } = useTranslation()

  useEffect(() => setMounted(true), [])

  if (!open) return null

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const selectedFile = files[0]
      if (selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Only .xlsx files are supported')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const selectedFile = files[0]
      if (selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Only .xlsx files are supported')
      }
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true)
      const blob = await downloadShipmentTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'shipment_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(t('shipments.import.errors.failed_download_template'))
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handlePreview = async () => {
    if (!file) return
    try {
      setIsLoading(true)
      setError(null)
      const preview = await previewShipmentImport(file)
      setPreviewData(preview)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('shipments.import.errors.failed_preview'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!file) return
    try {
      setIsLoading(true)
      setError(null)
      setStep('executing')
      const importResult = await executeShipmentImport(file)
      setResult(importResult)
      setStep('results')
      if (onSuccess) {
        onSuccess(importResult)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('shipments.import.errors.failed_execute'))
      setStep('preview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setPreviewData(null)
    setResult(null)
    setError(null)
    setExpandedErrorRow(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const validRows = previewData?.preview_rows.filter(r => r.validation_status === 'valid').length || 0
  const invalidRows = previewData?.preview_rows.filter(r => r.validation_status === 'invalid').length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className={`w-full max-w-4xl rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl transition-all ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('shipments.import.title')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {step === 'upload' && t('shipments.import.title')}
              {step === 'preview' && t('shipments.import.preview_heading')}
              {step === 'executing' && t('shipments.import.executing_heading')}
              {step === 'results' && t('shipments.import.results_heading')}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200 hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative rounded-[16px] border-2 border-dashed px-6 py-12 text-center transition ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/5'
                  : 'border-white/20 bg-slate-800/30 hover:border-white/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="rounded-full bg-sky-500/10 p-3">
                    <Download className="h-6 w-6 text-sky-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {file ? file.name : t('shipments.import.drag_drop_prompt')}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {file ? (
                      t('shipments.import.select_different_file')
                    ) : (
                      <>or <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sky-400 hover:underline"
                      >
                        {t('shipments.import.browse_files')}
                      </button></>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="rounded-[14px] border border-sky-500/30 bg-sky-500/5 px-4 py-3">
                <p className="text-sm text-sky-300">
                  ✓ {t('shipments.import.file_selected', { fileName: file.name })}
                </p>
              </div>
            )}

            <div className="space-y-2 rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('shipments.import.required_columns')}:</p>
              <p className="text-sm text-slate-300">
                {t('shipments.import.required_columns_list')}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2">{t('shipments.import.optional_columns')}:</p>
              <p className="text-sm text-slate-300">
                {t('shipments.import.optional_columns_list')}
              </p>
            </div>

            {error && (
              <div className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <p className="text-sm text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
              <div className="flex gap-2 sm:justify-start">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="rounded-[16px] border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/20 disabled:opacity-60"
                >
                  {downloadingTemplate ? t('shipments.import.download_template_loading') : t('shipments.import.download_template')}
                </button>
              </div>
              <div className="flex gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  {t('shipments.import.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!file || isLoading}
                  className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? t('shipments.import.previewing') : t('shipments.import.preview')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && previewData && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-4 rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.total_rows')}</p>
                <p className="text-2xl font-bold text-white">{previewData.total_rows}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.valid')}</p>
                <p className="text-2xl font-bold text-emerald-400">{validRows}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.invalid')}</p>
                <p className="text-2xl font-bold text-rose-400">{invalidRows}</p>
              </div>
            </div>

            {previewData.missing_required_columns.length > 0 && (
              <div className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <p className="text-sm text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {t('shipments.import.missing_required_columns', { columns: previewData.missing_required_columns.join(', ') })}
                </p>
              </div>
            )}

            {invalidRows > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-200">{t('shipments.import.validation_errors')}:</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {previewData.preview_rows
                    .filter(r => r.validation_status === 'invalid')
                    .map((row) => (
                      <div
                        key={row.row_number}
                        className="rounded-[12px] border border-rose-500/20 bg-rose-500/5 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedErrorRow(expandedErrorRow === row.row_number ? null : row.row_number)
                          }
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-500/10 transition"
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-400" />
                            <span className="text-sm text-slate-300">{t('shipments.import.row', { row: row.row_number })}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition ${
                              expandedErrorRow === row.row_number ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedErrorRow === row.row_number && (
                          <div className="border-t border-rose-500/20 px-4 py-3 space-y-2 bg-slate-900/50">
                            {row.validation_errors.map((err, idx) => (
                              <p key={idx} className="text-xs text-rose-300">
                                • {err}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <p className="text-sm text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                {t('shipments.import.back')}
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={invalidRows > 0 || previewData.missing_required_columns.length > 0 || isLoading}
                className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? t('shipments.import.importing') : t('shipments.import.import')}
              </button>
            </div>
          </div>
        )}

        {/* Executing Step */}
        {step === 'executing' && (
          <div className="space-y-4 py-12 text-center">
            <div className="flex justify-center">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 animate-spin"></div>
              </div>
            </div>
            <p className="text-slate-300">{t('shipments.import.processing')}</p>
            <p className="text-xs text-slate-400">{t('shipments.import.processing_hint')}</p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && result && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="rounded-[14px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm text-emerald-300 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {t('shipments.import.completed_success')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.total_rows')}</p>
                <p className="text-2xl font-bold text-white">{result.total_rows}</p>
              </div>
              <div className="rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.imported')}</p>
                <p className="text-2xl font-bold text-emerald-400">{result.successful_rows}</p>
              </div>
              <div className="rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.duplicates')}</p>
                <p className="text-2xl font-bold text-amber-400">{result.duplicate_rows}</p>
              </div>
              <div className="rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('shipments.import.failed')}</p>
                <p className="text-2xl font-bold text-rose-400">{result.failed_rows}</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-slate-700/50 bg-slate-800/30 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">{t('shipments.import.execution_time')}</p>
              <p className="text-sm font-semibold text-slate-200">{result.execution_time.toFixed(2)}s</p>
            </div>

            {result.validation_errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-200">{t('shipments.import.validation_errors_heading', { count: result.validation_errors.length })}</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.validation_errors.map((error) => (
                    <div
                      key={error.row_number}
                      className="rounded-[12px] border border-rose-500/20 bg-rose-500/5 px-4 py-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-rose-300">{t('shipments.import.error_row', { row: error.row_number })}</p>
                          <ul className="text-xs text-rose-300 mt-1 space-y-1">
                            {error.errors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                {t('shipments.import.close')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                {t('shipments.import.import_more')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
