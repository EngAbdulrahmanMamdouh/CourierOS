"use client"

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createPricingRule, deletePricingRule, fetchPricingRules, updatePricingRule } from '@/services/pricingRule'
import type { PricingRule, PricingRuleCreatePayload } from '@/types/pricingRule'
import PricingRuleTable from '@/components/pricing-rules/PricingRuleTable'
import CreatePricingRuleDialog from '@/components/pricing-rules/CreatePricingRuleDialog'

const PAGE_SIZE = 10

export default function PricingRulePageClient() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: pricingRules = [], isLoading, isError, error } = useQuery({
    queryKey: ['pricing-rules', page, PAGE_SIZE, appliedSearch],
    queryFn: () => fetchPricingRules(page, PAGE_SIZE, appliedSearch),
  })

  const summary = useMemo(() => ({
    total: pricingRules.length,
    active: pricingRules.filter((rule) => rule.is_active).length,
  }), [pricingRules])

  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setPage(1)
    setAppliedSearch('')
  }

  const handleSubmit = async (values: { [key: string]: string }) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: PricingRuleCreatePayload = {
        source_city_id: Number(values.source_city_id),
        destination_city_id: Number(values.destination_city_id),
        delivery_zone_id: values.delivery_zone_id ? Number(values.delivery_zone_id) : null,
        service_type: values.service_type,
        min_weight: Number(values.min_weight),
        max_weight: Number(values.max_weight),
        base_price: Number(values.base_price),
        extra_cost: Number(values.extra_cost),
        estimated_delivery_days: Number(values.estimated_delivery_days),
        is_active: values.is_active === 'true',
      }

      if (editingRule) {
        await updatePricingRule(editingRule.id, payload)
        toast.success('Pricing rule updated successfully')
      } else {
        await createPricingRule(payload)
        toast.success('Pricing rule created successfully')
      }

      await queryClient.invalidateQueries({ queryKey: ['pricing-rules'] })
      setIsCreateOpen(false)
      setEditingRule(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save pricing rule.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (pricingRule: PricingRule) => {
    if (!window.confirm('Delete this pricing rule?')) return

    try {
      await deletePricingRule(pricingRule.id)
      await queryClient.invalidateQueries({ queryKey: ['pricing-rules'] })
      toast.success('Pricing rule deleted successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete pricing rule.'
      toast.error(message)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Pricing rules</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage pricing rules</h1>
          <p className="mt-2 text-sm text-slate-400">Define shipping rules by route, weight band, and service type.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
            {summary.total} rules • {summary.active} active
          </div>
          <button type="button" onClick={() => { setEditingRule(null); setIsCreateOpen(true) }} className="inline-flex items-center gap-2 rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New rule
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30 lg:flex-row lg:items-center lg:justify-between">
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
            placeholder="Search pricing rules"
            className="h-12 flex-1 rounded-[16px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400"
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSearch} className="rounded-[16px] bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">Search</button>
            {(appliedSearch || searchInput) ? (
              <button type="button" onClick={handleClearSearch} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Clear</button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100">
            Page {page}
          </div>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={pricingRules.length < PAGE_SIZE} className="rounded-[16px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      <PricingRuleTable
        pricingRules={pricingRules}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : 'Unable to load pricing rules right now.'}
        onEdit={(rule) => { setEditingRule(rule); setIsCreateOpen(true) }}
        onDelete={handleDelete}
      />

      <CreatePricingRuleDialog open={isCreateOpen} onClose={() => { setIsCreateOpen(false); setEditingRule(null) }} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} editingRule={editingRule} />
    </>
  )
}
