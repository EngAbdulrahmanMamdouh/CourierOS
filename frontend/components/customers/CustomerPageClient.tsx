"use client"

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchCustomers, createCustomer } from '@/services/customer'
import CustomerTable from './CustomerTable'
import CreateCustomerDialog from './CreateCustomerDialog'

export default function CustomerPageClient() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState<any | null>(null)

  const { data: customers = [], isLoading, isError } = useQuery({ queryKey: ['customers'], queryFn: () => fetchCustomers(1, 100) })

  const summary = useMemo(() => ({ total: customers.length }), [customers])

  const handleCreate = async (values: any) => {
    console.log('CustomerPageClient handleCreate invoked', values)
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      console.log('CustomerPageClient calling createCustomer')
      await createCustomer(values)
      console.log('CustomerPageClient createCustomer resolved')
      await queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('customers.toast.created'))
      setIsCreateOpen(false)
    } catch (err) {
      console.log('CustomerPageClient handleCreate error', err)
      setSubmitError(err instanceof Error ? err.message : t('customers.toast.save_failed'))
      toast.error(err instanceof Error ? err.message : t('customers.toast.save_failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('customers.page.title')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('customers.page.manage')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('customers.page.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{t('customers.page.summary', { total: summary.total })}</div>
          <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">{t('customers.page.new_customer')}</button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-400">{t('customers.page.loading')}</p>
        ) : isError ? (
          <p className="text-rose-400">{t('customers.page.load_failed')}</p>
        ) : (
          <CustomerTable customers={customers} onEdit={(c) => setEditing(c)} onDeleted={() => queryClient.invalidateQueries({ queryKey: ['customers'] })} />
        )}
      </div>

      <CreateCustomerDialog open={isCreateOpen || Boolean(editing)} onClose={() => { setIsCreateOpen(false); setEditing(null) }} onSubmit={handleCreate} isSubmitting={isSubmitting} submitError={submitError} />
    </>
  )
}
