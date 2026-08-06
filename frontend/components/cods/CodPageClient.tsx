'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCodsQuery, useCreateCodMutation, useDeleteCodMutation, useUpdateCodMutation } from '@/hooks/useCodQueries'
import type { Cod, CodCreatePayload } from '@/types/cod'
import CodTable from './CodTable'
import CreateCodDialog from './CreateCodDialog'

export default function CodPageClient() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Cod | null>(null)

  const { data: cods = [], isLoading, isError } = useCodsQuery(page, size, search)
  const createMutation = useCreateCodMutation()
  const updateMutation = useUpdateCodMutation()
  const deleteMutation = useDeleteCodMutation()

  const filteredCods = useMemo(() => {
    return cods.filter((cod) => {
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'collected' ? cod.collected : !cod.collected)
      const matchesSearch = !search || [String(cod.shipment_id), String(cod.amount), cod.currency, cod.notes ?? ''].some((value) => value.toLowerCase().includes(search.toLowerCase()))
      return matchesStatus && matchesSearch
    })
  }, [cods, search, statusFilter])

  const summary = useMemo(() => ({
    total: filteredCods.length,
    collected: filteredCods.filter((cod) => cod.collected).length,
  }), [filteredCods])

  const handleCreate = async (values: CodCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values })
        toast.success(t('cods.toast.updated'))
      } else {
        await createMutation.mutateAsync(values)
        toast.success(t('cods.toast.created'))
      }

      setIsCreateOpen(false)
      setEditing(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('cods.toast.save_failed')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this COD record?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success(t('cods.toast.deleted'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('cods.toast.delete_failed'))
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('cods.page.title')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('cods.page.manage')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('cods.page.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{t('cods.page.summary', { total: summary.total })}</div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            {t('cods.page.new_cod')}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search COD"
          className="h-12 w-full rounded-[16px] border border-white/10 bg-slate-800/80 px-4 text-sm text-white outline-none transition focus:border-sky-400 sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-12 rounded-[16px] border border-white/10 bg-slate-800/80 px-4 text-sm text-white outline-none transition focus:border-sky-400"
        >
          <option value="all">All statuses</option>
          <option value="collected">Collected</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">{t('cods.page.loading')}</p>
        ) : isError ? (
          <p className="text-rose-400">{t('cods.page.load_failed')}</p>
        ) : (
          <CodTable
            cods={filteredCods}
            page={page}
            onPageChange={setPage}
            onEdit={(cod) => {
              setEditing(cod)
              setIsCreateOpen(true)
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreateCodDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          setEditing(null)
        }}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitError={submitError}
        editing={editing}
      />
    </>
  )
}
