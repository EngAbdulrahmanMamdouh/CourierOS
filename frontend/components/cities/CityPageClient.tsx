'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCitiesQuery, useCreateCityMutation, useDeleteCityMutation, useUpdateCityMutation } from '@/hooks/useCityQueries'
import type { City, CityCreatePayload } from '@/types/city'
import CityTable from './CityTable'
import CreateCityDialog from './CreateCityDialog'

const PAGE_SIZE = 10

export default function CityPageClient() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const { data: cities = [], isLoading, isError, error } = useCitiesQuery(page, PAGE_SIZE, appliedSearch)
  const createMutation = useCreateCityMutation()
  const updateMutation = useUpdateCityMutation()
  const deleteMutation = useDeleteCityMutation()

  const summary = useMemo(() => ({
    total: cities.length,
    active: cities.filter((city) => city.is_active).length,
  }), [cities])

  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setPage(1)
    setAppliedSearch('')
  }

  const handleSubmit = async (values: { name: string; code: string; governorate: string; is_active: string }) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: CityCreatePayload = {
        name: values.name,
        code: values.code,
        governorate: values.governorate,
        is_active: values.is_active === 'true',
      }

      if (editingCity) {
        await updateMutation.mutateAsync({ id: editingCity.id, payload })
        toast.success(t('cities.toast.updated'))
      } else {
        await createMutation.mutateAsync(payload)
        toast.success(t('cities.toast.created'))
      }

      setIsCreateOpen(false)
      setEditingCity(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('cities.toast.save_failed')
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (city: City) => {
    if (!window.confirm(t('common.action.confirm'))) return

    try {
      await deleteMutation.mutateAsync(city.id)
      toast.success(t('cities.toast.deleted'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('cities.toast.delete_failed'))
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('cities.page.title')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('cities.page.manage')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('cities.page.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
            {t('cities.page.summary', { total: summary.total, active: summary.active })}
          </div>
          <button type="button" onClick={() => { setEditingCity(null); setIsCreateOpen(true) }} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            {t('cities.page.new_city')}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSearch()
              }
            }}
            placeholder={t('cities.page.search_placeholder')}
            className="h-12 flex-1 rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSearch} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">{t('cities.page.search')}</button>
            {(appliedSearch || searchInput) ? (
              <button type="button" onClick={handleClearSearch} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">{t('cities.page.clear')}</button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            {t('cities.page.previous')}
          </button>
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100">
            {t('cities.page.page', { page })}
          </div>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={cities.length < PAGE_SIZE} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            {t('cities.page.next')}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <CityTable
          cities={cities}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : 'Unable to load cities right now.'}
          onEdit={(city) => { setEditingCity(city); setIsCreateOpen(true) }}
          onDelete={handleDelete}
        />
      </div>

      <CreateCityDialog
        open={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setEditingCity(null) }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        editingCity={editingCity}
      />
    </>
  )
}
