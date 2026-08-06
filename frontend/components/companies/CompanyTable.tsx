'use client'

import { Edit, Trash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Company } from '@/types/company'

type Props = {
  companies: Company[]
  page: number
  onPageChange: (page: number) => void
  onEdit: (company: Company) => void
  onDelete: (id: number) => void
}

export default function CompanyTable({ companies, page, onPageChange, onEdit, onDelete }: Props) {
  const { t, i18n } = useTranslation()

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('companies.page.title')}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{t('companies.list_title')}</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('companies.table.name')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('companies.table.email')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('companies.table.phone')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('companies.table.status')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('companies.table.created_at')}</th>
              <th className="py-4 pr-6 text-xs uppercase tracking-[0.25em]">{t('companies.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">{t('companies.no_companies')}</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="transition hover:bg-white/5">
                  <td className="py-5 pr-6 font-medium text-white">{company.name}</td>
                  <td className="py-5 pr-6">{company.email ?? '—'}</td>
                  <td className="py-5 pr-6">{company.phone ?? '—'}</td>
                  <td className="py-5 pr-6">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${company.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                      {company.is_active ? t('companies.option.is_active.active') : t('companies.option.is_active.inactive')}
                    </span>
                  </td>
                  <td className="py-5 pr-6">{new Date(company.created_at).toLocaleString(i18n.language)}</td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onEdit(company)} className="inline-flex items-center gap-2 rounded-[10px] bg-slate-900/80 px-3 py-1 text-sm text-slate-100">
                        <Edit className="h-4 w-4" /> {t('companies.edit')}
                      </button>
                      <button onClick={() => onDelete(company.id)} className="inline-flex items-center gap-2 rounded-[10px] bg-rose-600/10 px-3 py-1 text-sm text-rose-300">
                        <Trash className="h-4 w-4" /> {t('companies.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">{t('common.page', { page })}</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-[12px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
            {t('common.previous')}
          </button>
          <button type="button" onClick={() => onPageChange(page + 1)} className="rounded-[12px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200">
            {t('common.next')}
          </button>
        </div>
      </div>
    </section>
  )
}
