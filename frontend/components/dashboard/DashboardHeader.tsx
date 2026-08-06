'use client'

import { Bell, Search, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/src/components/LanguageSwitcher'
import { getLocaleFromLanguage } from '@/utils/locale'

type DashboardHeaderProps = {
  greeting: string
  dateLabel: string
}

export default function DashboardHeader({ greeting, dateLabel }: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const { t, i18n } = useTranslation()
  const locale = getLocaleFromLanguage(i18n.language)

  return (
    <section className="glass-card border-white/10 px-6 py-6 shadow-slate-950/20 fade-in">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr_auto] lg:items-center">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">{t('dashboard.operations')}</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">{greeting}</h1>
          <p className="text-sm text-slate-400" dir={locale === 'ar-EG' ? 'rtl' : 'ltr'}>{dateLabel}</p>
        </div>

        <div className="relative w-full">
          <Search className={`pointer-events-none absolute ${locale === 'ar-EG' ? 'right-4' : 'left-4'} top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400`} />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            type="search"
            placeholder={t('dashboard.search_placeholder')}
            className={`input h-14 w-full rounded-[18px] border-white/10 bg-slate-950/80 ${locale === 'ar-EG' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:bg-slate-900`}
          />
        </div>

       
        <div className={`flex items-center ${locale === 'ar-EG' ? 'justify-start' : 'justify-end'} gap-3`}>
          <LanguageSwitcher />

          <button
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#1F2937] transition hover:border-sky-400/40"
          >
            <Bell className="h-5 w-5 text-gray-300" />
          </button>

          <button
            className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#1F2937] px-3 py-2 transition hover:border-sky-400/40"
          >
            <UserCircle className="h-8 w-8 text-gray-300" />

            <div className={locale === 'ar-EG' ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium text-white">
                 Abdelrahman
              </p>

              <p className="text-xs text-gray-400">
                 {t('dashboard.role_administrator')}
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
