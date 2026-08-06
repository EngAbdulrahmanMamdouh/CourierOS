"use client"

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchDrivers, createDriver, updateDriver } from '@/services/driver'
import type { DriverCreatePayload } from '@/types/driver'
import DriverTable from './DriverTable'
import CreateDriverDialog from './CreateDriverDialog'

export default function DriverPageClient() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState<any | null>(null)

  const { data: drivers = [], isLoading, isError } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => fetchDrivers(1, 100),
  })

  const summary = useMemo(() => ({
    total: drivers.length,
    active: drivers.filter((driver) => driver.is_active).length,
  }), [drivers])

  const handleCreate = async (values: DriverCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editing) {
        await updateDriver(editing.id, values)
        toast.success(t('drivers.toast.updated'))
      } else {
        await createDriver(values)
        toast.success(t('drivers.toast.created'))
      }

      await queryClient.invalidateQueries({ queryKey: ['drivers'] })
      setIsCreateOpen(false)
      setEditing(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('drivers.toast.save_failed')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('drivers.page.title')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('drivers.page.manage')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('drivers.page.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{t('drivers.page.summary', { total: summary.total })}</div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            {t('drivers.page.new_driver')}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">{t('drivers.page.loading')}</p>
        ) : isError ? (
          <p className="text-rose-400">{t('drivers.page.load_failed')}</p>
        ) : (
          <DriverTable drivers={drivers} onEdit={(driver) => { setEditing(driver); setIsCreateOpen(true) }} onDeleted={() => queryClient.invalidateQueries({ queryKey: ['drivers'] })} />
        )}
      </div>

      <CreateDriverDialog open={isCreateOpen} onClose={() => { setIsCreateOpen(false); setEditing(null) }} onSubmit={handleCreate} isSubmitting={isSubmitting} submitError={submitError} editing={editing} />
    </>
  )
}
