'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCompaniesQuery, useCreateCompanyMutation, useDeleteCompanyMutation, useUpdateCompanyMutation } from '@/hooks/useCompanyQueries'
import type { Company, CompanyCreatePayload } from '@/types/company'
import CompanyTable from './CompanyTable'
import CreateCompanyDialog from './CreateCompanyDialog'

export default function CompanyPageClient() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Company | null>(null)

  const { data: companies = [], isLoading, isError } = useCompaniesQuery(page, size)
  const createMutation = useCreateCompanyMutation()
  const updateMutation = useUpdateCompanyMutation()
  const deleteMutation = useDeleteCompanyMutation()

  const summary = useMemo(() => ({
    total: companies.length,
    active: companies.filter((company) => company.is_active).length,
  }), [companies])

  const handleCreate = async (values: CompanyCreatePayload) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values })
        toast.success(t('companies.toast.updated'))
      } else {
        await createMutation.mutateAsync(values)
        toast.success(t('companies.toast.created'))
      }

      setIsCreateOpen(false)
      setEditing(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('companies.toast.save_failed')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this company?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success(t('companies.toast.deleted'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('companies.toast.delete_failed'))
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('companies.page.title')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('companies.page.manage')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('companies.page.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{t('companies.page.summary', { total: summary.total })}</div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            {t('companies.page.new_company')}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">{t('companies.page.loading')}</p>
        ) : isError ? (
          <p className="text-rose-400">{t('companies.page.load_failed')}</p>
        ) : (
          <CompanyTable
            companies={companies}
            page={page}
            onPageChange={setPage}
            onEdit={(company) => {
              setEditing(company)
              setIsCreateOpen(true)
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreateCompanyDialog
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
